
import React, { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStep: number;
  onReportClick: () => void;
  onStepChange: (step: number) => void;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  activeStep, 
  onReportClick, 
  onStepChange 
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("0");
  const [captchaResponse, setCaptchaResponse] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Focus management for accessibility
  useEffect(() => {
    const stepContent = document.getElementById(`form_step_${activeStep}`);
    if (stepContent) {
      const focusable = stepContent.querySelector('[tabindex="0"]');
      if (focusable && focusable instanceof HTMLElement) {
        focusable.focus();
      }
    }
  }, [activeStep]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedReason(event.target.value);
  };

  const handleSubmitReason = () => {
    // Logic for specific reason paths
    if (selectedReason === "4") { // IP violation
      onStepChange(5);
    } else if (selectedReason === "7") { // Other
      onStepChange(4);
    } else {
      onStepChange(2); // Go to captcha
    }
  };

  const handleSubmitReport = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    
    if (!captchaResponse) {
      setError("Complete o processo de verificação.");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate submitting the report
    setTimeout(() => {
      setIsSubmitting(false);
      onStepChange(3); // Success step
      toast({
        title: "Relatório enviado",
        description: "Obrigado por enviar seu relatório."
      });
    }, 1500);
  };

  // Render different steps based on activeStep
  const renderStep = () => {
    switch(activeStep) {
      case 0: // Terms
        return (
          <div className="form-content" id="form_step_0" aria-labelledby="termsTitle" aria-describedby="termsDesc" tabIndex={0}>
            <h2 id="termsTitle" className="form-title">Condições e suporte</h2>
            <p id="termsDesc" className="form-body">Este site foi criado com o Canva, mas o conteúdo dele pertence ao usuário e está sujeito aos nossos <a className="a-link" href="https://www.canva.com/policies/terms-of-use/" target="_blank">Termos de Uso</a>. Caso veja algo que viole as nossas <a className="a-link" href="https://www.canva.com/policies/acceptable-use-policy/" target="_blank">políticas de uso aceitável</a>, notifique nossa equipe de revisão de conteúdo.</p>
            <div className="form-buttons">
              <button onClick={onClose} type="button" className="tertiary-button">
                <span className="button-text">
                  Fechar
                </span>
              </button>
              <button onClick={onReportClick} type="button" className="button">
                <span className="button-text">
                  Notificar
                </span>
              </button>
            </div>
          </div>
        );
      
      case 1: // Report reason
        return (
          <div className="form-content" id="form_step_1" aria-labelledby="reportTitle" aria-describedby="reportDesc" tabIndex={0}>
            <h2 id="reportTitle" className="form-title">Denunciar</h2>
            <p id="reportDesc" className="form-body">As notificações de conteúdo ajudam o Canva a garantir que o conteúdo seja apropriado e esteja corretamente etiquetado.</p>
            <p className="form-body-bold">Por que você está notificando o Canva sobre este conteúdo?</p>
            
            {[
              { id: "0", label: "Conteúdo inapropriado" },
              { id: "1", label: "Discriminação, discurso ou atividades que incitam o ódio" },
              { id: "2", label: "Conteúdo ilegal" },
              { id: "3", label: "Difamação ou assédio" },
              { id: "4", label: "Violação de propriedade intelectual" },
              { id: "5", label: "Informações incorretas" },
              { id: "6", label: "Phishing" },
              { id: "7", label: "Outro" }
            ].map(reason => (
              <label key={reason.id} className="form-radio-input" htmlFor={`report_reason_${reason.id}`}>
                <input 
                  id={`report_reason_${reason.id}`} 
                  className="radio-button-input" 
                  type="radio" 
                  name="report_reason" 
                  value={reason.id} 
                  checked={selectedReason === reason.id}
                  onChange={handleReasonChange}
                />
                <span className="radio-button"></span>
                <span className="form-radio-label">
                  {reason.label}
                </span>
              </label>
            ))}
            
            <div className="form-buttons">
              <button onClick={onClose} type="button" className="button">
                <span className="button-text">Cancelar</span>
              </button>
              <button onClick={handleSubmitReason} type="button" className="submit-button">
                <span className="button-text">Avançar</span>
              </button>
            </div>
          </div>
        );
      
      case 2: // Captcha
        return (
          <div className="form-content" id="form_step_2" aria-labelledby="captchaTitle" aria-describedby="captchaDesc" tabIndex={0}>
            <h2 id="captchaTitle" className="form-title">Denunciar</h2>
            <p id="captchaDesc" className="form-body">Só queremos verificar se você é uma pessoa.</p>
            <form onSubmit={handleSubmitReport}>
              <div className="g-recaptcha-placeholder" style={{ width: '300px', height: '74px', backgroundColor: '#f9f9f9', border: '1px solid #d3d3d3', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#555' }}>Simulação de Captcha</p>
              </div>
              {error && (
                <p className="text-danger">
                  {error}
                </p>
              )}
              <div className="form-buttons">
                <button onClick={() => onStepChange(1)} type="button" className="button">
                  <span className="button-text">Voltar</span>
                </button>
                <button type="submit" className={`submit-button ${isSubmitting ? 'loading' : ''}`}>
                  <span className="button-text">Enviar</span>
                </button>
              </div>
            </form>
          </div>
        );
      
      case 3: // Success
        return (
          <div className="form-content" id="form_step_3" aria-labelledby="thanksTitle" aria-describedby="thanksDesc" tabIndex={0}>
            <h2 id="thanksTitle" className="form-title">Obrigado</h2>
            <p id="thanksDesc" className="form-body">Obrigado por sinalizar esse conteúdo como inapropriado. Nossa equipe de revisão está trabalhando nisso e o conteúdo será analisado o mais rápido possível.</p>
            <div className="form-buttons">
              <button onClick={onClose} type="button" className="submit-button">
                <span className="button-text">
                  Fechar
                </span>
              </button>
            </div>
          </div>
        );
      
      case 4: // Other
        return (
          <div className="form-content" id="form_step_4" aria-labelledby="otherTitle" aria-describedby="otherDesc" tabIndex={0}>
            <h2 id="otherTitle" className="form-title">Outro</h2>
            <p id="otherDesc" className="form-body">Entre em contato com o Canva através do e-mail <a className="a-link" href="mailto:privacy@canva.com" target="_blank">privacy@canva.com</a> e inclua a URL do site para relatar seu problema.</p>
            <div className="form-buttons">
              <button onClick={() => onStepChange(1)} type="button" className="button">
                <span className="button-text">Voltar</span>
              </button>
              <button onClick={onClose} type="button" className="submit-button">
                <span className="button-text">Fechar</span>
              </button>
            </div>
          </div>
        );
      
      case 5: // IP Violation
        return (
          <div className="form-content" id="form_step_5" aria-labelledby="ipTitle" aria-describedby="ipDesc" tabIndex={0}>
            <h2 id="ipTitle" className="form-title">Violação de propriedade intelectual</h2>
            <p id="ipDesc" className="form-body">Envie ao Canva um aviso de violação seguindo os passos indicados na nossa <a className="a-link" href="https://www.canva.com/policies/intellectual-property-policy/" target="_blank">Política de Propriedade Intelectual</a>.</p>
            <div className="form-buttons">
              <button onClick={() => onStepChange(1)} type="button" className="button">
                <span className="button-text">Voltar</span>
              </button>
              <button onClick={onClose} type="button" className="submit-button">
                <span className="button-text">Fechar</span>
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <div id="modal_backdrop" className={`modal-backdrop ${isOpen ? 'active' : ''}`}></div>
      <div 
        id="modal" 
        className={`report-form-modal ${isOpen ? 'active' : ''}`} 
        role="dialog"
        ref={modalRef}
      >
        {renderStep()}
      </div>
    </>
  );
};

export default Modal;
