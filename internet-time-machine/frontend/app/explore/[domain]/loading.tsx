export default function Loading() {
  return (
    <div className="flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full px-4 md:px-6 pb-[120px] select-none">
      {/* Toolbar Skeleton */}
      <div className="w-full h-[76px] bg-bg-secondary border border-border-default rounded-xl p-4 flex items-center justify-between">
        <div className="space-y-2 w-1/3">
          <div className="h-5 bg-border-bright rounded-md w-1/2 skeleton" />
          <div className="h-3 bg-border-subtle rounded-md w-3/4 skeleton" />
        </div>
        <div className="flex gap-2 w-32">
          <div className="h-8 bg-border-bright rounded-lg w-10 skeleton" />
          <div className="h-8 bg-border-bright rounded-lg w-20 skeleton" />
        </div>
      </div>

      {/* Main split content skeleton */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch min-h-[500px]">
        {/* Sidebar skeleton */}
        <div className="w-full lg:w-[350px] shrink-0 bg-bg-primary rounded-xl border border-border-subtle p-4 space-y-4">
          <div className="flex bg-bg-elevated p-0.5 rounded-lg h-9">
            <div className="flex-1 bg-bg-secondary rounded-md skeleton" />
            <div className="flex-1 bg-transparent rounded-md" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-border-bright rounded-md w-1/4 skeleton" />
            <div className="h-3 bg-border-subtle rounded-md w-full skeleton" />
            <div className="h-3 bg-border-subtle rounded-md w-5/6 skeleton" />
            <div className="h-3 bg-border-subtle rounded-md w-11/12 skeleton" />
          </div>
        </div>

        {/* Viewport skeleton */}
        <div className="flex-1 bg-bg-secondary rounded-xl border border-border-default overflow-hidden flex flex-col">
          <div className="h-12 bg-bg-elevated border-b border-border-default p-3 flex items-center justify-between">
            <div className="w-16 h-4 bg-border-bright rounded skeleton" />
            <div className="w-64 h-4 bg-border-bright rounded skeleton" />
            <div className="w-24 h-4 bg-border-bright rounded skeleton" />
          </div>
          <div className="flex-1 bg-bg-base flex items-center justify-center p-8">
            <div className="w-16 h-16 border-4 border-t-gold border-border-bright rounded-full animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
}
