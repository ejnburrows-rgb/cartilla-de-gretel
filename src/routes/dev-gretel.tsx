import { createFileRoute } from '@tanstack/react-router';
import { useGretelAnimation } from '@/components/gretel/useGretelAnimation';
import type { GretelEvent } from '@/components/gretel/gretelMachine';

export const Route = createFileRoute('/dev-gretel')({
  component: DevGretelDemo,
});

function DevGretelDemo() {
  if (!import.meta.env.DEV) return null;
  return <DevGretelDemoInner />;
}

function DevGretelDemoInner() {
  const { currentPose, machineState, send, isRecovering } = useGretelAnimation();

  const handleEvent = (type: GretelEvent['type']) => {
    send({ type } as GretelEvent);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6">Gretel Animation FSM Dev Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* State Monitor */}
        <div className="bg-stone-100 p-6 rounded-xl shadow-sm border border-stone-200">
          <h2 className="text-xl font-semibold mb-4">Machine State</h2>
          <div className="space-y-3">
            <div>
              <span className="font-bold text-stone-500">State:</span>{' '}
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-mono">
                {machineState}
              </span>
            </div>
            <div>
              <span className="font-bold text-stone-500">Pose Asset:</span>{' '}
              <span className="font-mono text-sm break-all">{currentPose}</span>
            </div>
            <div>
              <span className="font-bold text-stone-500">Recovering:</span>{' '}
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${isRecovering ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {isRecovering ? 'Yes (Fallback)' : 'No (HD Asset)'}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-stone-600 mb-3">Controls</h3>
            <div className="flex flex-wrap gap-2">
              {['INIT', 'IDLE', 'BLINK', 'SPEAK_START', 'SPEAK_STOP', 'WAVE', 'POINT', 'CHEER', 'ASSET_ERROR', 'RESET'].map((evt) => (
                <button
                  key={evt}
                  onClick={() => handleEvent(evt as GretelEvent['type'])}
                  className="px-4 py-2 bg-white border border-stone-300 rounded hover:bg-stone-50 active:bg-stone-200 transition-colors text-sm font-medium"
                >
                  {evt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="flex items-center justify-center bg-stone-50 rounded-xl border border-stone-200 p-8 min-h-[400px]">
          <div className="relative h-64 w-64 drop-shadow-xl animate-fade-in">
            <img
              src={currentPose}
              alt="Gretel Demo"
              className="w-full h-full object-contain transition-opacity duration-200"
              onError={() => send({ type: 'ASSET_ERROR' })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
