
import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";

const DixavaPage: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="root-container">
      <main>
        <div className="_4KoDHA">
          <div className="ZRRuDw">
            <div style={{ height: '100%', width: '100%' }}>
              <div className="KYQZFA">
                <section 
                  id="PBL63rwLSHxgjPRp" 
                  className="rGeu6w"
                  data-scroll-ready="true" 
                  style={{ backgroundColor: 'rgb(255, 255, 255)' }}
                >
                  <div>
                    <div className="onhyOQ" style={{ width: '100%', height: '100vh', alignItems: 'center' }}>
                      <div className="twbtjQ">
                        <div className="GDnEHQ" style={{ width: '100%', height: '100vh', backgroundColor: 'rgb(255, 255, 255)' }}>
                          <div className="o2Yl2g">
                            <div className="_mXnjA" lang="pt-BR" style={{ width: '100%', height: '100vh' }}>
                              <div className="_6t4CHA">
                                <div className="a26Xuw">
                                  <div className="fbzKiw" style={{ background: 'rgb(255, 255, 255)' }}></div>
                                </div>
                              </div>

                              <div className="DF_utQ _682gpw _0xkaeQ" style={{ touchAction: "pan-x pan-y pinch-zoom", width: '100%', height: '100vh', transform: 'translate(0px, 0px)' }}>
                                <div style={{ width: '100%', height: '100vh', transform: 'scale(1, 1)', transformOrigin: '0px 0px' }}>
                                  <div className="S3wQqg lKZixA _8YzbFQ">
                                    <iframe 
                                      src="/dixava-content" 
                                      width="100%" 
                                      height="100%" 
                                      frameBorder="0" 
                                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox" 
                                      referrerPolicy="strict-origin-when-cross-origin"
                                      style={{ width: '100%', height: '100%' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <Footer />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DixavaPage;
