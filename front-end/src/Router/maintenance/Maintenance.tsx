// src/Router/maintenance/Maintenance.tsx
import React from "react";

const Maintenance: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[80vh] gap-4 p-4 text-ctdark dark:text-light">
      <h1 className="text-4xl font-bold">서버 점검 중</h1>
      <p className="text-center">현재 서버 점검 중입니다. 불편을 드려 죄송합니다.</p>
    </div>
  );
};

export default Maintenance;
