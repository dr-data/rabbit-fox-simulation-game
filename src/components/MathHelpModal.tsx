/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, X, Calculator, Waves, Sparkles, Activity } from 'lucide-react';

interface MathHelpModalProps {
  isOpen: boolean;
  isLightMode?: boolean;
  onClose: () => void;
}

export const MathHelpModal: React.FC<MathHelpModalProps> = ({ isOpen, isLightMode = false, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 font-mono">
      <div
        className={`border rounded-lg max-w-3xl w-full p-4 text-xs shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto ${
          isLightMode
            ? 'bg-white border-slate-300 text-slate-800 shadow-slate-400'
            : 'bg-zinc-950 border-emerald-500/80 text-zinc-200 shadow-emerald-950/50'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b pb-2 mb-3 ${
            isLightMode ? 'border-slate-200' : 'border-emerald-900/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-500" />
            <span className="font-bold text-sm text-emerald-600 tracking-wider">
              LOTKA–VOLTERRA // MATHEMATICAL BIOLOGY COMPENDIUM
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded cursor-pointer ${
              isLightMode ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className={`space-y-4 leading-relaxed text-[12px] ${isLightMode ? 'text-slate-700' : 'text-zinc-300'}`}>
          {/* Section 1: Classic Model */}
          <section
            className={`p-3 rounded border space-y-2 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
            }`}
          >
            <h3 className="font-bold text-emerald-600 text-xs flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              1. THE CLASSIC LOTKA–VOLTERRA SYSTEM (1925 / 1926)
            </h3>
            <p>
              Formulated independently by Alfred J. Lotka (chemical kinetics & biophysics) and Vito Volterra (Adriatic fisheries), 
              the system models the non-linear interaction between a prey species (Rabbits $R$) and a predator species (Foxes $F$).
            </p>
            <div
              className={`p-2.5 rounded border font-mono space-y-1 ${
                isLightMode ? 'bg-white border-slate-300 text-emerald-800' : 'bg-black/80 border-zinc-700 text-emerald-300'
              }`}
            >
              <div>dR/dt = α·R - β·R·F <span className="text-zinc-500">(Prey growth minus Predation)</span></div>
              <div>dF/dt = δ·R·F - γ·F <span className="text-zinc-500">(Predator reproduction minus Mortality)</span></div>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-500">
              <li><strong className="text-emerald-600">α (Alpha):</strong> Natural birth rate of rabbits in the absence of predators.</li>
              <li><strong className="text-orange-600">β (Beta):</strong> Predation attack coefficient (rate of rabbits eaten per fox encounter).</li>
              <li><strong className="text-rose-600">γ (Gamma):</strong> Natural starvation/death rate of foxes without prey.</li>
              <li><strong className="text-emerald-600">δ (Delta):</strong> Conversion efficiency of consumed rabbits into newborn foxes.</li>
            </ul>
          </section>

          {/* Section 2: Phase Space & Stability */}
          <section
            className={`p-3 rounded border space-y-2 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
            }`}
          >
            <h3 className="font-bold text-amber-600 text-xs flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              2. PHASE SPACE ORBITS & CONSERVED QUANTITY
            </h3>
            <p>
              The classic Lotka-Volterra equations form a Hamiltonian-like conservative dynamical system with closed periodic orbits in the $(R, F)$ phase plane.
              The constant of motion is:
            </p>
            <div
              className={`p-2 rounded border font-mono text-[11px] ${
                isLightMode ? 'bg-white border-slate-300 text-amber-800' : 'bg-black/80 border-zinc-700 text-amber-300'
              }`}
            >
              V(R, F) = δ·R - γ·ln(R) + β·F - α·ln(F) = Constant
            </div>
            <p className="text-[11px] text-zinc-500">
              Equilibrium point is located at <strong className="text-emerald-600">R* = γ/δ</strong> and <strong className="text-orange-600">F* = α/β</strong>. 
              The eigenvalues of the linearized Jacobian matrix at this point are purely imaginary (λ = ±i√(αγ)), producing neutral center oscillations.
            </p>
          </section>

          {/* Section 3: Extensions */}
          <section
            className={`p-3 rounded border space-y-2 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
            }`}
          >
            <h3 className="font-bold text-cyan-600 text-xs flex items-center gap-1.5">
              <Waves className="w-4 h-4" />
              3. MATHEMATICAL EXTENSIONS (INCORPORATED IN THIS SIMULATOR)
            </h3>
            <div className="space-y-2 text-[11px]">
              <div className={`p-2 rounded border ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/60 border-zinc-800'}`}>
                <span className="text-emerald-600 font-bold">A. Logistic Carrying Capacity (K): </span>
                <span>dR/dt = α·R(1 - R/K) - β·R·F. Prevents infinite prey explosion and converts the neutral cycle into an asymptotically stable spiral focus.</span>
              </div>
              <div className={`p-2 rounded border ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/60 border-zinc-800'}`}>
                <span className="text-amber-600 font-bold">B. Seasonality Environmental Forcing: </span>
                <span>α(t) = α₀(1 + A·sin(2πt / T)). Introduces periodic external drive causing seasonal population booms in Spring and crashes in Winter.</span>
              </div>
              <div className={`p-2 rounded border ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/60 border-zinc-800'}`}>
                <span className="text-rose-600 font-bold">C. Dual Predator Competition (Wolves): </span>
                <span>Adds Apex Predator W with predation β_W·R·W and interspecific interference competition -μ·F·W.</span>
              </div>
              <div className={`p-2 rounded border ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/60 border-zinc-800'}`}>
                <span className="text-purple-600 font-bold">D. Human Harvesting & Stochastics: </span>
                <span>Incorporates -h_R·R, -h_F·F and Gaussian Brownian noise σ·√N·dW for realistic environmental shocks.</span>
              </div>
            </div>
          </section>

          {/* Section 4: Numerical Integration */}
          <section
            className={`p-3 rounded border space-y-1.5 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
            }`}
          >
            <h3 className="font-bold text-emerald-600 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              4. NUMERICAL INTEGRATION: RUNGE-KUTTA 4TH ORDER (RK4)
            </h3>
            <p className="text-[11px] text-zinc-500">
              To avoid the artificial numerical energy drift of simple Euler integration, the simulation engine calculates four intermediate slope approximations ($k_1, k_2, k_3, k_4$) per timestep $dt$, ensuring $O(dt^4)$ global accuracy and exceptional long-term orbital stability.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className={`mt-4 pt-2 border-t flex justify-end ${isLightMode ? 'border-slate-200' : 'border-zinc-800'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded font-bold cursor-pointer transition border ${
              isLightMode
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                : 'bg-emerald-900 hover:bg-emerald-800 border-emerald-600 text-emerald-200'
            }`}
          >
            CLOSE GUIDE [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
