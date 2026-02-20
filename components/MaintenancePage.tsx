import React from "react";

import maintBg from "../Image/tryon-maint-bg.webp";
import maintRobot from "../Image/maint-robot.webp";

const MaintenancePage: React.FC = () => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${maintBg})` }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 w-full max-w-7xl px-8">

        {/* ── LEFT: Robot ── */}
        {/* To increase robot size: change the w-[...] values below.
            Current: sm=400px, md=480px, lg=580px
            Larger:  sm=440px, md=520px, lg=640px  ← just bump each value */}
        <div className="flex-shrink-0 w-[420px] sm:w-[520px] md:w-[620px] lg:w-[760px] md:-ml-16">
          <img
            src={maintRobot}
            alt="Maintenance Robot"
            className="w-full h-auto block "
          />
        </div>

        {/* ── RIGHT: Text ── */}
        <div className="flex flex-col items-start text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#191919] leading-none tracking-tight">
            We’ll Be Back Shortly
          </h1>
          <div className="w-16 h-[4px] bg-[#7ed957] rounded-full mt-5 mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-gray-900 leading-snug mb-5">
            System maintenance in progress.
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-500 leading-relaxed max-w-xl">
            We are currently performing scheduled maintenance to improve our
            services. We'll be back online shortly. Thank you for your patience!
          </p>
        </div>

      </div>
    </div>
  );
};

export default MaintenancePage;
