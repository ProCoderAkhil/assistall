import React, { useState } from 'react';
import { Star, CheckCircle, CreditCard, Loader2, Banknote, ShieldCheck, MessageSquare } from 'lucide-react';
import { useToast } from './ToastContext'; // ✅ Import Context

const RateAndTip = ({ requestData, onSkip, onSubmit }) => {
  const { addToast } = useToast(); // ✅ Use Global Toast
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [selectedTip, setSelectedTip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState('online');

  const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'https://assistall-server.onrender.com';

  // --- 1. HELPER: Load Razorpay Script Dynamically ---
  const loadRazorpayScript = () => {
      return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
      });
  };

  // --- 2. PAYMENT: Handle Online Payment ---
  const handleOnlinePayment = async () => {
      setLoading(true);
      
      const res = await loadRazorpayScript();
      if (!res) {
          addToast('Razorpay SDK failed to load. Check internet.', 'error');
          setLoading(false);
          return;
      }

      try {
          // A. Create Order on Backend
          const orderRes = await fetch(`${DEPLOYED_API_URL}/api/payment/orders`, {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: selectedTip })
          });
          
          if (!orderRes.ok) throw new Error("Failed to create order");
          const orderData = await orderRes.json();

          // B. Configure Razorpay Options
          const options = {
              key: "rzp_test_S44Rgy9G3Yrika",
              amount: orderData.amount,
              currency: orderData.currency,
              name: "AssistAll Tip",
              description: `Tip for ${requestData?.volunteerName}`,
              order_id: orderData.id,
              handler: async function (response) {
                  // C. Verify Payment on Backend
                  try {
                      const verifyRes = await fetch(`${DEPLOYED_API_URL}/api/payment/verify`, {
                          method: 'POST',
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                              razorpay_order_id: response.razorpay_order_id,
                              razorpay_payment_id: response.razorpay_payment_id,
                              razorpay_signature: response.razorpay_signature,
                          }),
                      });
                      
                      const verifyData = await verifyRes.json();
                      if (verifyData.status === 'success') {
                          // D. Success! Submit Review
                          handleFinalSubmit('online');
                      } else {
                          addToast("Payment Verification Failed", "error");
                          setLoading(false);
                      }
                  } catch (e) {
                      addToast("Server Error during verification", "error");
                      setLoading(false);
                  }
              },
              theme: { color: "#16a34a" },
              modal: {
                  ondismiss: function() {
                      setLoading(false);
                  }
              }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
      } catch (err) {
          console.error(err);
          addToast("Error initiating payment", "error");
          setLoading(false);
      }
  };

  const handleCashPayment = () => {
      setLoading(true);
      addToast(`Please give ₹${selectedTip} cash to the volunteer.`, "info");
      
      // Simulate delay for user to read toast
      setTimeout(() => {
          handleFinalSubmit('cash');
      }, 2500);
  };

  const submitReviewOnly = () => {
      handleFinalSubmit('none');
  };

  const handleFinalSubmit = async (method) => {
      // If called directly (no payment), ensure loading is set
      if (!loading) setLoading(true);

      try {
        // Send rating and review to backend
        await fetch(`${DEPLOYED_API_URL}/api/requests/${requestData._id}/review`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                rating, 
                review: feedback, 
                tip: selectedTip, 
                paymentMethod: selectedTip > 0 ? method : 'none' 
            })
        });

        addToast("Thank you for your feedback!", "success");
        onSubmit(); 
      } catch (err) {
        console.error("Review Error:", err);
        addToast("Failed to submit review", "error");
        onSubmit(); 
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-[3000] p-6 pb-12 animate-in slide-in-from-bottom duration-500 font-sans border-t border-gray-100">
      
      <div className="text-center mb-6">
          <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 border-4 border-green-50 animate-bounce">
              <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ride Completed!</h2>
          <p className="text-gray-500 font-medium">How was {requestData?.volunteerName}?</p>
      </div>

      <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                  key={star} 
                  size={36} 
                  className={`cursor-pointer transition-all duration-200 hover:scale-110 ${star <= rating ? 'text-yellow-400 fill-current drop-shadow-sm' : 'text-gray-200'}`} 
                  onClick={() => setRating(star)}
              />
          ))}
      </div>

      <div className="mb-6 relative">
          <MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} />
          <textarea 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 pl-12 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition resize-none text-gray-700 placeholder-gray-400"
              rows="2"
              placeholder="Write a quick review (optional)..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
          />
      </div>

      <p className="font-bold text-gray-400 mb-3 text-center text-xs uppercase tracking-widest">Add a Tip</p>
      <div className="grid grid-cols-4 gap-3 mb-6">
          {[0, 20, 50, 100].map((amt) => (
              <button 
                  key={amt} 
                  onClick={() => setSelectedTip(amt)} 
                  className={`py-3 rounded-xl font-bold border transition-all ${selectedTip === amt ? 'bg-black text-white border-black shadow-lg scale-105' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
              >
                  {amt === 0 ? "No" : `₹${amt}`}
              </button>
          ))}
      </div>

      {selectedTip > 0 && (
          <div className="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100 animate-in fade-in zoom-in">
              <p className="text-[10px] font-black text-blue-600 uppercase mb-3 flex items-center gap-1">
                  <ShieldCheck size={12}/> Secure Payment
              </p>
              <div className="flex gap-3">
                  <button onClick={() => setPaymentMode('online')} className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center transition ${paymentMode === 'online' ? 'border-blue-600 bg-white text-blue-700 shadow-md' : 'border-transparent bg-blue-100/50 text-gray-500 hover:bg-white'}`}>
                      <CreditCard size={20} className="mb-1"/>
                      <span className="text-xs font-bold">Online</span>
                  </button>
                  <button onClick={() => setPaymentMode('cash')} className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center transition ${paymentMode === 'cash' ? 'border-green-600 bg-white text-green-700 shadow-md' : 'border-transparent bg-green-100/50 text-gray-500 hover:bg-white'}`}>
                      <Banknote size={20} className="mb-1"/>
                      <span className="text-xs font-bold">Cash</span>
                  </button>
              </div>
          </div>
      )}

      {selectedTip > 0 ? (
          <button 
              onClick={paymentMode === 'online' ? handleOnlinePayment : handleCashPayment} 
              disabled={loading} 
              className={`w-full text-white font-bold py-4 rounded-2xl mb-3 transition flex items-center justify-center shadow-xl active:scale-95 ${paymentMode === 'online' ? 'bg-[#3395ff] hover:bg-[#287acc]' : 'bg-green-600 hover:bg-green-700'}`}
          >
              {loading ? <><Loader2 className="animate-spin mr-2" size={20}/> Processing...</> : paymentMode === 'online' ? `Pay ₹${selectedTip}` : `Confirm Cash Payment`}
          </button>
      ) : (
          <button 
              onClick={submitReviewOnly} 
              disabled={loading}
              className="w-full bg-black text-white font-bold py-4 rounded-2xl mb-3 hover:bg-gray-800 shadow-xl active:scale-95 flex items-center justify-center"
          >
              {loading ? <Loader2 className="animate-spin" size={20}/> : "Submit Review"}
          </button>
      )}

      <button onClick={onSkip} className="w-full text-gray-400 font-bold text-sm hover:text-gray-600 transition">Skip</button>
    </div>
  );
};

export default RateAndTip;