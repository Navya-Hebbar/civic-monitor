const Loader = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 backdrop-blur-xl z-[100] flex items-center justify-center">
    <div className="flex flex-col items-center gap-6 relative">
      {/* Animated gradient orb */}
      <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse -translate-y-8" />
      
      {/* Spinner */}
      <div className="relative z-10">
        <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 border-r-purple-600 border-b-pink-600 rounded-full animate-spin shadow-2xl"></div>
      </div>
      
      {/* Text */}
      <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 font-black text-xl relative z-10">
        Loading...
      </p>
      
      {/* Floating dots */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default Loader;