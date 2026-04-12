import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { useVendorId } from '@/hooks/useVendor';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const { login, isLoading: isAuthLoading } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const vendorId = useVendorId();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || `/${vendorId}/`;

  useEffect(() => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = `+91${phoneNumber}`;
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      if (!confirmationResult) throw new Error("No confirmation result found");
      
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();
      
      await login(idToken);
      toast.success('Welcome back!');
      navigate(redirect);
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Invisible Recaptcha Container */}
      <div id="recaptcha-container"></div>

      <div className="hidden lg:block lg:w-1/2 bg-primary relative">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-semibold text-primary-foreground mb-4">Welcome to<br /><span className="text-gold">Golden Era</span></h2>
            <p className="font-body text-primary-foreground/60 max-w-sm">Discover timeless elegance and find the perfect piece for every occasion.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link to={`/${vendorId}/`} className="font-heading text-2xl font-semibold tracking-wide text-foreground mb-8 block">
            GOLDEN ERA<span className="text-gold">.</span>
          </Link>
          <h1 className="font-heading text-2xl font-semibold mb-2">Sign In</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">
            {step === 'phone' ? 'Enter your phone number to continue' : 'Enter the code sent to your phone'}
          </p>

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">Phone Number</label>
                <div className="flex">
                  <span className="px-3 py-3 bg-secondary/50 border border-r-0 border-border rounded-l-sm text-sm font-body text-muted-foreground">+91</span>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 px-4 py-3 bg-transparent border border-border rounded-r-sm text-sm font-body outline-none focus:border-gold transition-colors"
                    placeholder="10-digit number" />
                </div>
              </div>
              
              <button type="submit" disabled={isLoading || isAuthLoading}
                className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-medium uppercase tracking-widest hover:bg-charcoal-light transition-colors disabled:opacity-50">
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex flex-col items-center">
                <label className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-4 self-start">Verification Code</label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <div className="space-y-3">
                <button type="submit" disabled={isLoading || isAuthLoading}
                  className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-medium uppercase tracking-widest hover:bg-charcoal-light transition-colors disabled:opacity-50">
                  {isLoading || isAuthLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
                <button type="button" onClick={() => setStep('phone')} className="w-full py-2 text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
                  Change Phone Number
                </button>
              </div>
            </form>
          )}

          <p className="font-body text-sm text-muted-foreground text-center mt-6">
            Don't have an account? <Link to={`/${vendorId}/register`} className="text-gold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

