import { useState, useEffect } from "react";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

const ResponsivePageLayout = ({ children, rightSidebar }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="responsive-page-layout" style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      maxWidth: '1280px',
      margin: '0 auto',
      width: '100%',
      padding: isMobile ? '0' : '24px',
      marginTop: isMobile ? '0' : '0'  // Explicitly ensuring no extra top margin on mobile
    }}>
      {!isMobile && <LeftSidebar />}

      <div style={{
        flex: 1,
        maxWidth: isMobile ? '100%' : '600px',
        width: '100%'
      }}>
        {children}
      </div>

      {!isMobile && (rightSidebar || <RightSidebar />)}
    </div>
  );
};

export default ResponsivePageLayout;
