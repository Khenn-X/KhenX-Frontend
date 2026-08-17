import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import background from '../../assets/living2.jfif';
import IntelligenceChat from '../neighbourhood/IntelligenceChat';
import IntelligenceChatTeaser from '../neighbourhood/IntelligenceChatTeaser';
import { useAuth } from '../../hooks/useAuth';

export const NextGenSearch: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showRealChat, setShowRealChat] = useState(false);

  const renderChatPanel = () => {
    if (isAuthenticated || showRealChat) {
      return <IntelligenceChat />;
    }

    return <IntelligenceChatTeaser onTryNow={() => setShowRealChat(true)} />;
  };

  return (
    <section className="relative overflow-hidden py-20 bg-[#F2F4FA]">
      {/* Faint decorative background image — sits behind all content.
          Replace the src below with your actual image path (e.g. an import,
          or a path under /public such as "/images/next-gen-search-bg.png").
          object-cover + opacity keep it subtle and non-distracting. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img
          src={background}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-10"
        />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#00C9A7]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-[#0F172A]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div>
            <div className="mb-4">
              <p className="text-xs font-bold text-[#0F9D8D] uppercase tracking-widest">
                Next-Gen Search
              </p>
            </div>

<h2 className="text-4xl lg:text-5xl font-extrabold text-[#0F172A] mb-6 leading-tight">
              Search like you speak to a local expert.
            </h2>

            {/* Features List */}
            <div className="space-y-5 mb-8">
              {/* Lifestyle match — single-line, icon vertically centered */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-[#D2F4EC]">
                  <CheckCircle2 className="h-4 w-4 text-[#0F9D8D]" strokeWidth={2.5} />
                </div>
                <p className="text-base font-bold text-[#0F172A]">
                  Find properties that match your lifestyle
                </p>
              </div>

              {/* Key location info — single-line, icon vertically centered */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-[#D2F4EC]">
                  <CheckCircle2 className="h-4 w-4 text-[#0F9D8D]" strokeWidth={2.5} />
                </div>
                <p className="text-base font-bold text-[#0F172A]">
                  Key information on your desired locations across different metrics
                </p>
              </div>

              {/* Natural Language Processing */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-[#D2F4EC]">
                  <CheckCircle2 className="h-4 w-4 text-[#0F9D8D]" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] mb-1">
                    Natural Language Processing
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Looking for a quiet 3-bed in Yaba with 20+ hours of daily power.
                  </p>
                </div>
              </div>

              {/* Intelligence Filters */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-[#D2F4EC]">
                  <CheckCircle2 className="h-4 w-4 text-[#0F9D8D]" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] mb-1">
                    Intelligence Filters
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Filter by flood history, security ratings, internet availability, proximity to gym, schools, markets and more.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Live AI Intelligence Chat */}
          <div className="lg:flex justify-center">
            <div className="w-full max-w-[32rem]">
              {renderChatPanel()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NextGenSearch;