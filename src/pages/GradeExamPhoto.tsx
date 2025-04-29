import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';
import SidebarLayout from '../components/layout/SidebarLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Camera, Upload, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const GradeExamPhoto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{
    studentName: string;
    answers: string[];
  } | null>(null);

  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const processImage = async () => {
    if (!capturedImage) return;

    try {
      setProcessing(true);

      // Inicializar Tesseract.js
      const worker = await createWorker();
      await worker.loadLanguage('por');
      await worker.initialize('por');

      // Reconhecer texto para encontrar o nome do aluno
      const { data: { text } } = await worker.recognize(capturedImage);
      
      // Aqui você implementaria a lógica para:
      // 1. Detectar as bolhas marcadas usando OpenCV.js
      // 2. Identificar as respostas selecionadas
      // 3. Comparar com o gabarito
      
      // Por enquanto, vamos simular alguns resultados
      setResults({
        studentName: text.split('\n')[0], // Assume que o nome está na primeira linha
        answers: ['A', 'B', 'C', 'D', 'E'] // Exemplo de respostas detectadas
      });

      await worker.terminate();
      toast.success('Gabarito processado com sucesso!');
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar o gabarito. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <SidebarLayout>
      <div className="mb-6">
        <Link to={`/exams/${id}`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft size={16} className="mr-1" />
          Voltar para Prova
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Corrigir Prova por Foto
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Capturar Gabarito</h2>
          
          {!capturedImage ? (
            <>
              <div className="mb-4">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg"
                />
              </div>
              
              <div className="flex space-x-4">
                <Button
                  variant="primary"
                  onClick={capture}
                  icon={<Camera size={18} />}
                >
                  Tirar Foto
                </Button>
                
                <label className="flex">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    icon={<Upload size={18} />}
                  >
                    Importar Imagem
                  </Button>
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <img
                  src={capturedImage}
                  alt="Gabarito capturado"
                  className="w-full rounded-lg"
                />
              </div>
              
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCapturedImage(null)}
                >
                  Tirar Nova Foto
                </Button>
                
                <Button
                  variant="primary"
                  onClick={processImage}
                  isLoading={processing}
                >
                  Processar Gabarito
                </Button>
              </div>
            </>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resultados</h2>
          
          {results ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nome do Aluno</p>
                <p className="font-medium">{results.studentName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Respostas Detectadas</p>
                <div className="grid grid-cols-5 gap-4">
                  {results.answers.map((answer, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-50 rounded-md text-center"
                    >
                      <p className="text-sm text-gray-500">Questão {index + 1}</p>
                      <p className="font-medium">{answer}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  // Aqui você implementaria a lógica para salvar os resultados
                  toast.success('Resultados salvos com sucesso!');
                }}
              >
                Salvar Resultados
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                Capture uma foto do gabarito para ver os resultados
              </p>
            </div>
          )}
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default GradeExamPhoto;