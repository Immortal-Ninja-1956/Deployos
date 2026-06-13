export default function DisclaimerBanner() {
  return (
    <div className="bg-signal text-panel font-bold flex items-center justify-center py-2 px-4 text-xs font-arcade tracking-wider select-none relative" role="banner">
      <div className="flex items-center text-center">
        <span className="animate-pulse mr-2">⚠️</span>
        NearMiss is an educational visualization. It is NOT an official planetary defense resource.
        <span className="animate-pulse ml-2">⚠️</span>
      </div>
    </div>
  );
}
