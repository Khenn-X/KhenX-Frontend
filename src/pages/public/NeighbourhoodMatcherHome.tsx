import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { buildNeighbourhoodMatchQuery } from '../../lib/neighbourhoodMatchQuery';
import { useNeighbourhoodQuizStore } from '../../store/neighbourhoodQuiz.store';
import { lifestylesApi } from '../../api/lifestyles.api';

// ─── Quiz flow definition ─────────────────────────────────────────────────────

type StepId = 'budget' | 'priority' | 'commute' | 'lifestyle';

interface Option { label: string; value: string }

interface Step {
  id:       StepId;
  question: string;
  options:  Option[];
}

const BASE_STEPS: Step[] = [
  {
    id:       'budget',
    question: 'What is your monthly housing budget?',
    options: [
      { label: 'Under ₦200,000',         value: 'under-200k'    },
      { label: '₦200,000 – ₦600,000',    value: '200k-600k'     },
      { label: 'Above ₦600,000',          value: 'above-600k'    },
    ],
  },
  {
    id:       'priority',
    question: 'What matters most to you?',
    options: [
      { label: 'Reliable power & infrastructure', value: 'power'    },
      { label: 'Security & safety',               value: 'security' },
      { label: 'Low flood risk',                  value: 'flood'    },
      { label: 'Short commute to work',           value: 'commute'  },
    ],
  },
  {
    id:       'commute',
    question: 'Where do you work or spend most time?',
    options: [
      { label: 'Victoria Island / Ikoyi', value: 'VI'      },
      { label: 'Ikeja / Maryland',        value: 'Ikeja'   },
      { label: 'Lekki / Ajah',            value: 'Lekki'   },
      { label: 'Yaba / Surulere',         value: 'Yaba'    },
    ],
  },
];

const LIFESTYLE_STEP_ID: StepId = 'lifestyle';

// ─── Component ───────────────────────────────────────────────────────────────

export default function NeighbourhoodMatcher() {
  const navigate = useNavigate();
  const setQuizInputs = useNeighbourhoodQuizStore((state) => state.setInputs);
  const lifestylesQuery = useQuery({
    queryKey: ['lifestyles'],
    queryFn: lifestylesApi.getAll,
    staleTime: 1000 * 60 * 10,
  });
  const lifestyleOptions: Option[] = (lifestylesQuery.data?.data?.profiles ?? [])
    .map((profile) => ({ label: profile.name, value: profile.slug }));
  const steps: Step[] = [
    ...BASE_STEPS,
    {
      id: LIFESTYLE_STEP_ID,
      question: 'Which of these best describes you?',
      options: lifestyleOptions,
    },
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers]         = useState<Record<StepId, string>>({
    budget:   '',
    priority: '',
    commute:  '',
    lifestyle: '',
  });
  const [selected, setSelected] = useState('');

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const isLast = currentStep === totalSteps - 1;

  const handleSelect = (value: string) => {
    setSelected(value);
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
  };

  const handleNext = () => {
    const canAdvance = Boolean(selected) || step.id === LIFESTYLE_STEP_ID;
    if (!canAdvance) return;

    const latestAnswers = {
      budget: answers.budget,
      priority: answers.priority,
      commute: answers.commute,
      lifestyle: step.id === LIFESTYLE_STEP_ID ? selected || answers.lifestyle : answers.lifestyle,
    };

    if (isLast) {
      const nextLifestyle = selected || answers.lifestyle || null;
      setQuizInputs({
        budget: latestAnswers.budget,
        priority: latestAnswers.priority,
        commute: latestAnswers.commute,
        workLocation: latestAnswers.commute,
        lifestyleSlug: nextLifestyle,
      });

      const params = buildNeighbourhoodMatchQuery({
        budget: latestAnswers.budget,
        priority: latestAnswers.priority,
        commute: latestAnswers.commute,
        lifestyle: nextLifestyle,
      });
      navigate(`/neighbourhood/match?${params.toString()}`);
    } else {
      setCurrentStep((s) => s + 1);
      setSelected('');
    }
  };

  const progressPct = ((currentStep) / totalSteps) * 100;

  return (
    <section className="rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2">

        {/* Left panel — pitch */}
        <div className="bg-[#0A1628] p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#00C9A7] mb-3">
              AI-Powered
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              Get Your Personalised<br />Neighbourhood Match
            </h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Answer 3 simple questions and we'll rank Lagos districts
              based on your specific life needs.
            </p>
          </div>

          {/* Social proof */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-7 w-7 rounded-full bg-slate-600 border-2 border-[#0A1628] flex items-center justify-center"
                >
                  <Users className="h-3 w-3 text-slate-300" />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Used by <span className="text-white font-semibold">5,000+</span> Lagosians this week
            </p>
          </div>
        </div>

        {/* Right panel — quiz */}
        <div className="p-6 sm:p-8 flex flex-col">
          {/* Progress */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-xs font-semibold text-[#00C9A7] uppercase tracking-wide">
              {step.id === 'lifestyle' ? 'Lifestyle' : step.id}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-slate-200 mb-6">
            <div
              className="h-1 rounded-full bg-[#00C9A7] transition-all duration-300"
              style={{ width: `${progressPct + (100 / totalSteps)}%` }}
            />
          </div>

          {/* Question */}
          <p className="text-sm font-bold text-[#0F172A] mb-4">{step.question}</p>

          {/* Options */}
          <div className="space-y-2 flex-1">
            {step.options.map((opt) => {
              const isSelected = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'w-full min-h-11 flex items-center justify-between rounded-xl border px-4 py-3 text-sm text-left transition-all',
                    isSelected
                      ? 'border-[#00C9A7] bg-[#00C9A7]/8 text-[#0A1628] font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-[#00C9A7] shrink-0" />}
                </button>
              );
            })}
          </div>

          {step.id === LIFESTYLE_STEP_ID && (
            <button
              type="button"
              onClick={() => {
                setSelected('');
                setAnswers((prev) => ({ ...prev, lifestyle: '' }));
              }}
              className={cn(
                'mt-3 w-full min-h-11 rounded-xl border px-4 py-3 text-sm text-left transition-colors',
                selected === ''
                  ? 'border-[#00C9A7] bg-[#00C9A7]/8 text-[#0A1628] font-semibold'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
              )}
            >
              Not sure / skip
            </button>
          )}

          {/* CTA */}
          <button
            onClick={handleNext}
            disabled={!selected && step.id !== LIFESTYLE_STEP_ID}
            className="mt-5 min-h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A1628] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0A1628]/90 disabled:opacity-40 transition-colors"
          >
            {isLast ? 'Find My Match' : 'Next Question'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </section>
  );
}