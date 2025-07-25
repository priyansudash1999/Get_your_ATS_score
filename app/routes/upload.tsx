import React, { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import FileUploader from '~/components/FileUploader'
import Navbar from '~/components/Navbar'
import { AIResponseFormat, prepareInstructions } from '~/constants'
import { convertPdfToImage } from '~/lib/pdftoimage'
import { usePuterStore } from '~/lib/puter'
import { generateUUID } from '~/lib/utils'

const upload = () => {
  const {auth, isLoading, fs, ai, kv} = usePuterStore()
  const navigate = useNavigate()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleFileSelect:(file:File | null) => void = (file: File | null) => {
    setFile(file)
  }
  const handleAnalyse = async ({companyName, jobTitle, jobDescription}: {companyName: string, jobTitle: string,jobDescription: string, file: File}) => {
    setIsProcessing(true)
    setStatusText("Uploading file")

    if (file) {
      const uploadedFile = await fs.upload([file])
      if (!uploadedFile) return setStatusText('Error: Failed to upload file')

      setStatusText('converting to image')
      const imageFile = await convertPdfToImage(file)

      if(!imageFile) return setStatusText('Error: Failed to convert file from Pdf to Image...')

      setStatusText('Uploading the image...')

      if(imageFile  && imageFile.file){
        const uploadedImage = await fs.upload([imageFile.file])

        if(!uploadedImage) return setStatusText('Error: Failed to upload image')
        
        setStatusText('Preparing data...')

        const uuid = generateUUID()

        const data = {
          id: uuid,
          resumePath: uploadedFile.path,
          imagePath: uploadedImage.path,
          companyName,
          jobTitle,
          jobDescription,
          feedback: ""
        }

        await kv.set(`resume: ${uuid}`, JSON.stringify(data))
        setStatusText('Analysing your resume...')

        const feedback = await ai.feedback(
          uploadedFile.path,
          prepareInstructions({jobTitle, jobDescription, AIResponseFormat})
        )
        
        if(!feedback) return setStatusText('Error: Failed to analyse...')
        
        const feedbackText = feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text

        data.feedback = JSON.parse(feedbackText)

        await kv.set(`resume: ${uuid}`, JSON.stringify(data))

        setStatusText('Analysis complete. redirecting to you...')
        console.log(data);
        
      }

    }
    
  }
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget.closest('form')
    if(!form) return
    const formData = new FormData(form)

    const companyName = formData.get('company-name') as string
    const jobTitle = formData.get('job-title') as string
    const jobDescription = formData.get('job-desc') as string

    // console.log((companyName));
    // console.log(jobTitle)
    // console.log(jobDescription);

    if(!file) return

    handleAnalyse({companyName, jobTitle, jobDescription, file})

  }

  return (
    <main className=" bg-[url('/images/bg-main.svg')] bg-cover">  //
      <Navbar />
      <section className="main-section">
        <div className="page-heading">
          <h1>Smart Feedback for your Job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="public\images\resume-scan.gif" alt="" className='w-full'/>
            </>
          ) : 
          (
            <h2>Drop your resume to get your ATS score</h2>
          )
          }
          {
            !isProcessing && (
              <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-6'>
                <div className='form-div'>
                  <label htmlFor="company-name">Company name</label>
                  <input type="text" name="company-name" id="company-name" required placeholder='company-name'  />
                </div>
                <div className='form-div'>
                  <label htmlFor="job-title">Job Title</label>
                  <input type="text" name="job-title" id="job-title" placeholder='job-title' required/>
                </div>
                <div className='form-div'>
                  <label htmlFor="job-desc">Job Description</label>
                  <textarea rows={5} name="job-desc" id="job-desc" placeholder='job-description'  required/>
                </div>
                <label htmlFor="job-desc">Upload Resume</label>
                <div className='uploader w-full bg-white rounded-lg'>
                  <FileUploader onFileSelect={handleFileSelect}/>
                </div>

                <button className='primary-button' type='submit' >
                  Analyse Resume
                </button>
              </form>
            )
          }
        </div>
      </ section>
    </ main>
  )
}

export default upload