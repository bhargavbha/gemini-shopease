import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { useVendorId } from '@/hooks/useVendor';

const Register = () => {
  const vendorId = useVendorId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await register({ name, email, password });
      toast.success('Account created! Please sign in.');
      navigate(`/${vendorId}/login`);
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block lg:w-1/2 bg-primary relative">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-semibold text-primary-foreground mb-4">Join<br /><span className="text-gold">Golden Era</span></h2>
            <p className="font-body text-primary-foreground/60 max-w-sm">Create your account and start your journey into luxury.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link to={`/${vendorId}/`} className="font-heading text-2xl font-semibold tracking-wide text-foreground mb-8 block">
            GOLDEN ERA<span className="text-gold">.</span>
          </Link>
          <h1 className="font-heading text-2xl font-semibold mb-2">Create Account</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">Join us and discover exclusive collections</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors"
                placeholder="Jane Doe" />
            </div>
            <div>
              <label className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors"
                placeholder="your@email.com" />
            </div>
            <div>
              <label className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-medium uppercase tracking-widest hover:bg-charcoal-light transition-colors disabled:opacity-50">
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="font-body text-sm text-muted-foreground text-center mt-6">
            Already have an account? <Link to={`/${vendorId}/login`} className="text-gold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
