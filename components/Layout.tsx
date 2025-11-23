import React from 'react';
import { 
  User, 
  FileText, 
  Users, 
  Fingerprint, 
  Camera, 
  FlaskConical, 
  Eye, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { LOGO_URL } from '../utils';

interface LayoutProps {
  currentStep: number;
  children: React.ReactNode;
}

const steps = [
  { num: 1, label: 'Login', icon: User },
  { num: 2, label: 'Ocorrência', icon: FileText },
  { num: 3, label: 'Millenium', icon: Users },
  { num: 4, label: 'Vestígios', icon: Fingerprint },
  { num: 5, label: 'FIP', icon: Camera },
  { num: 6, label: 'Laboratório', icon: FlaskConical },
  { num: 7, label: 'Observações', icon: Eye },
  { num: 8, label: 'Laudo', icon: CheckCircle },
];

export const Layout: React.FC<LayoutProps> = ({ currentStep, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-black text-neutral-200 flex flex-col md:flex-row font-sans selection:bg-yellow-500 selection:text-black">
      {/* Mobile Header */}
      <div className="md:hidden bg-neutral-900 border-b border-neutral-800 p-4 flex justify-between items-center shadow-md z-20 relative">
        <div className="flex items-center space-x-3">
          <img 
            src={LOGO_URL} 
            alt="Logo PCDF" 
            className="h-10 w-auto"
            crossOrigin="anonymous"
          />
          <span className="font-bold text-lg text-white tracking-wide">SPLO - PCDF</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-yellow-500">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar - Hidden on small mobile, visible on desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block shadow-2xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-neutral-800 flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-10 rounded-full group-hover:opacity-20 transition-opacity"></div>
            <img 
              src={LOGO_URL} 
              alt="Logo PCDF" 
              className="h-24 w-auto relative z-10 drop-shadow-lg"
              crossOrigin="anonymous"
            />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-2xl tracking-wider">SPLO</h1>
            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.2em]">Polícia Civil DF</p>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-240px)]">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <div
                key={step.num}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 border-l-4 ${
                  isActive
                    ? 'bg-neutral-800 border-yellow-500 text-white shadow-lg shadow-black/50'
                    : isCompleted
                    ? 'border-transparent text-yellow-600/70 hover:bg-neutral-800/50'
                    : 'border-transparent text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300'
                }`}
              >
                <div className={`mr-3 ${isActive ? 'text-yellow-500' : isCompleted ? 'text-yellow-600/70' : ''}`}>
                  {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{step.label}</p>
                </div>
              </div>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center border-t border-neutral-800 bg-neutral-900">
          <p className="text-xs text-neutral-600">Versão 1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-black relative">
         {/* Background pattern/gradient */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none"></div>
         
        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 flex items-center justify-center">
          {/* Mobile Container Simulation */}
          <div className="w-full max-w-md bg-black border-neutral-800 md:border md:rounded-[3rem] md:shadow-2xl md:p-2 min-h-[800px] md:h-[850px] flex flex-col relative overflow-hidden">
             
             {/* Watermark Logo */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <img 
                    src={LOGO_URL} 
                    className="w-80 opacity-5 grayscale filter blur-[1px]" 
                    alt="" 
                    crossOrigin="anonymous"
                />
             </div>

             {/* Phone Notch Simulation (Desktop only) */}
             <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-900 rounded-b-xl z-50"></div>
             
             {/* Status Bar Simulation */}
             <div className="h-8 w-full flex justify-between items-center px-6 text-[10px] text-neutral-500 font-mono select-none relative z-10">
                <span>9:41</span>
                <div className="flex space-x-1">
                    <span>5G</span>
                    <span>100%</span>
                </div>
             </div>

             {/* Screen Content */}
             <div className="flex-1 overflow-y-auto scrollbar-hide p-4 relative z-10">
                {children}
             </div>

             {/* Bottom Home Indicator (Desktop only) */}
             <div className="hidden md:flex justify-center pb-2 pt-4 relative z-10">
                <div className="w-32 h-1 bg-neutral-800 rounded-full"></div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};