import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import Button from '../ui/Button';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

interface AnswerSheetPDFProps {
  examTitle: string;
  totalQuestions: number;
}

const AnswerSheetPDF: React.FC<AnswerSheetPDFProps> = ({ examTitle, totalQuestions }) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!sheetRef.current) return;

    try {
      const dataUrl = await toPng(sheetRef.current, { quality: 0.95 });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Calculate dimensions to fit image on page
      const imgWidth = 210 - 40; // A4 width minus margins
      const imgHeight = (sheetRef.current.offsetHeight * imgWidth) / sheetRef.current.offsetWidth;
      
      pdf.addImage(dataUrl, 'PNG', 20, 20, imgWidth, imgHeight);
      pdf.save(`${examTitle.replace(/\s+/g, '_')}_answer_sheet.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-10 shadow-md rounded-lg" ref={sheetRef}>
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold">{examTitle}</h1>
          <p className="text-gray-500 mt-2">Answer Sheet</p>
          
          <div className="mt-6 border-t border-b border-gray-300 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <p className="font-semibold">Name:</p>
                <div className="mt-1 border-b border-gray-400 w-full h-6"></div>
              </div>
              <div className="text-left">
                <p className="font-semibold">Date:</p>
                <div className="mt-1 border-b border-gray-400 w-full h-6"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div key={i} className="mb-4">
                <p className="font-semibold mb-2">Question {i + 1}</p>
                <div className="flex space-x-4">
                  {['A', 'B', 'C', 'D', 'E'].map((option) => (
                    <div key={option} className="flex items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
                        {option}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button
          variant="primary"
          onClick={downloadPDF}
          icon={<FileDown size={18} />}
        >
          Download Answer Sheet
        </Button>
      </div>
    </div>
  );
};

export default AnswerSheetPDF;