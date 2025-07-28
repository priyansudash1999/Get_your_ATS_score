import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import ATS from '~/components/ATS';
import Details from '~/components/Details';
import Summary from '~/components/Summary';
import { usePuterStore } from '~/lib/puter';

export const meta: () => {
  title?: string;
  name?: string;
  content?: string;
}[] = () => [
  { title: 'ResuScan | Review' },
  { name: 'description', content: 'Analysis of your resume' },
];

const Resume = () => {
  const { fs, kv, isLoading } = usePuterStore();
  const { id } = useParams();

  const [imageUrl, setImageUrl] = useState<string>('');
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const {auth} = usePuterStore()
  const navigate = useNavigate();

  useEffect(() => {
    if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`)
  }, [isLoading])

  useEffect(() => {
    const loadResume = async () => {
      let resume = await kv.get(`resume:${id}`); 
      if (!resume) return;

      const data = JSON.parse(resume);

      // Fetch PDF blob and generate URL
      const resumeBlob = await fs.read(data.resumePath);
      if (resumeBlob) {
        const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setResumeUrl(pdfUrl);
      }

      // Fetch image blob and generate URL
      const imageBlob = await fs.read(data.imagePath);
      if (imageBlob) {
        const imgUrl = URL.createObjectURL(imageBlob);
        setImageUrl(imgUrl);
      }

      setFeedback(data.feedback);
    };

    loadResume();
  }, [id, fs, kv]);

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">Back to Home</span>
        </Link>
      </nav>
      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="feedback-section bg-[url(/images/bg-small.svg)] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={imageUrl}
                  className="w-full h-full rounded-2xl object-contain"
                  alt="resume-img"
                  title="resume"
                />
              </a>
              
            </div>
          )}
        </section>

        <section className='feedback-section'>
          <h2 className='text-3xl !text-black font-bold'>Resume Review</h2>
          {
            feedback ? (
              <div>
                <div className='flex flex-col gap-8 animate-in fade-in duration-1000'>
                  Summary of Your ATS Score
                  <Summary feedback={feedback}/>
                  {/* <ATS score = {feedback.ATS.score || 0} suggestions = {feedback.ATS.tips || []}/> */}
                  {/* <Details feedback={feedback}/> */}
                </div>  
              </div>
            ): (
              <img src="/images/resume-scan-2.gif" alt="" className='w-full'/>
            )
          }
        </section>
      </div>
    </main>
  );
};

export default Resume;
