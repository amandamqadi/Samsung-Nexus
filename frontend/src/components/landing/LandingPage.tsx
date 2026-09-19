import Navbar from './Navbar';
import Hero from './Hero';
import TrustStrip from './TrustStrip';
import HowItWorks from './HowItWorks';
import Features from './Features';
import CtaBand from './CtaBand';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-primary flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Features />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
