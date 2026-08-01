import React, { ReactNode } from "react";

const GridContainer = ({
  cols,
  children,
  className,
}: {
  cols: number;
  children: ReactNode;
  className?: string;
}) => {
  // تجاوب الجوال والتابلت تلقائياً مع جعل cols هي القيمة للشاشات الكبيرة (Desktop)
  const gridClasses: { [key: number]: string } = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6",
    7: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7",
    8: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8",
    9: "grid-cols-3 sm:grid-cols-6 lg:grid-cols-9",
    10: "grid-cols-2 sm:grid-cols-5 lg:grid-cols-10",
    11: "grid-cols-2 sm:grid-cols-6 lg:grid-cols-11",
    12: "grid-cols-2 sm:grid-cols-6 lg:grid-cols-12",
  };

  const selectedClass = gridClasses[cols] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${selectedClass} ${className || ""}`}>
      {children}
    </div>
  );
};

export default GridContainer;