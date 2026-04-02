import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(redirect);
    } catch {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
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
          <Link to="/" className="font-heading text-2xl font-semibold tracking-wide text-foreground mb-8 block">
            GOLDEN ERA<span className="text-gold">.</span>
          </Link>
          <h1 className="font-heading text-2xl font-semibold mb-2">Sign In</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors"
                placeholder="your@email.com" />
            </div>
            <div>
              <label className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors pr-10"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-medium uppercase tracking-widest hover:bg-charcoal-light transition-colors disabled:opacity-50">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="font-body text-sm text-muted-foreground text-center mt-6">
            Don't have an account? <Link to="/register" className="text-gold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
