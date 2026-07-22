import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const SkeletonCustom = ({ circle }: { circle?: boolean }) => {
  return (
    <div className="flex items-center space-x-4">
      {circle && <Skeleton className="h-12 w-12 rounded-full" />}
      <div className="space-y-2">
        <Skeleton className="h-4 w-[230px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
};

export default SkeletonCustom;
