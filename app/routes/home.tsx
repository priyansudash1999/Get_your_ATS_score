import { resumes } from "~/constants";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResuScan" },
    { name: "description", content: "Get your ATS score!" },
  ];
}

export default function Home() {
  const {auth} = usePuterStore()
  const navigate = useNavigate()


  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/')
  }, [auth.isAuthenticated])


  
  return <main className=" bg-[url('/images/bg-main.svg')] bg-cover">  //
    <Navbar />
    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Application and Get Your ATS score by AI</h1>
        <h2>Review your submission and get feedback from AI</h2>
      </div>
    
    {
      resumes.length > 0 && (
        <div className="resumes-section">
          {
            resumes.map((res) => (
              <ResumeCard key={res.id} resume={res}/>
            ))
          }
        </div>
      )
    }
    </section>

    
  </main>
}
