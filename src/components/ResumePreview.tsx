import React from "react";
import { CVData } from "../types";

interface ResumePreviewProps {
  cvData: CVData;
  language: "ar" | "en";
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ cvData, language }) => {
  const isRtl = language === "ar";
  const { personal, experience, education, projects, languages, skills, selectedTemplate } = cvData;

  // Render separate templates inside a standard page layout
  return (
    <div
      id="printable-cv-area"
      dir={isRtl ? "rtl" : "ltr"}
      style={{ fontFamily: isRtl ? "'Tajawal', sans-serif" : "'Inter', sans-serif" }}
      className={`w-full max-w-[800px] mx-auto bg-white text-slate-950 p-[2.5cm] shadow-xl border border-slate-100 min-h-[1128px] relative transition-all duration-300 print:shadow-none print:border-none print:p-0 print:m-0`}
    >
      {/* Template 1: CLASSIC (1-Column Traditional) */}
      {selectedTemplate === "classic" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-950">
              {personal.name || (isRtl ? "الاسم بالكامل" : "FULL NAME")}
            </h1>
            {personal.title && (
              <p className="text-[11pt] font-medium text-slate-800 tracking-wide mt-1">
                {personal.title}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9pt] text-slate-700 font-sans mt-2">
              {[
                personal.phone && personal.phone.trim(),
                personal.email && personal.email.trim(),
                personal.website && personal.website.trim(),
                personal.location && personal.location.trim()
              ]
                .filter(Boolean)
                .map((item, index, arr) => (
                  <span key={index} className="flex items-center gap-3">
                    <span>{item}</span>
                    {index < arr.length - 1 && <span className="text-slate-400 font-light font-sans">|</span>}
                  </span>
                ))}
            </div>
            <hr className="border-t border-slate-950 mt-3 mb-4" />
          </div>

          {/* Professional Narrative */}
          {personal.summary && (
            <div className="space-y-1">
              <h2 className="text-[10pt] font-bold uppercase tracking-wider text-slate-950">
                {isRtl ? "الملخص المهني" : "PROFESSIONAL SUMMARY"}
              </h2>
              <hr className="border-t border-slate-950 my-1" />
              <p className="text-[9.5pt] leading-relaxed text-slate-900 whitespace-pre-line text-justify pt-1">
                {personal.summary}
              </p>
            </div>
          )}

          {/* Experience list */}
          {experience.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-[10pt] font-bold uppercase tracking-wider text-slate-950">
                {isRtl ? "الخبرة المهنية" : "PROFESSIONAL EXPERIENCE"}
              </h2>
              <hr className="border-t border-slate-950 my-1" />
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline text-[10pt] font-bold text-slate-950">
                      <div>{exp.role}</div>
                      <div className="text-[9pt] font-semibold text-slate-600 font-sans">{exp.duration}</div>
                    </div>
                    <div className="text-[9.5pt] text-slate-700 font-medium font-sans">
                      {[exp.company, exp.location].filter(Boolean).join(" | ")}
                    </div>
                    {exp.description && (
                      <div className="space-y-1 mt-1.5 text-[9.5pt] text-slate-900 leading-relaxed text-justify">
                        {exp.description.split("\n").map((line, lIdx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return null;
                          const cleanContent = trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.startsWith("*")
                            ? trimmed.slice(1).trim()
                            : trimmed;
                          return (
                            <div key={lIdx} className="flex gap-2">
                              <span className="shrink-0 text-slate-950">-</span>
                              <span>{cleanContent}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Journey */}
          {education.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-[10pt] font-bold uppercase tracking-wider text-slate-950">
                {isRtl ? "المؤهل العلمي" : "EDUCATION"}
              </h2>
              <hr className="border-t border-slate-950 my-1" />
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="space-y-0.5 text-[10pt]">
                    <div className="flex justify-between items-baseline font-bold text-slate-950">
                      <div>{edu.degree}</div>
                      <div className="text-[9pt] font-semibold text-slate-600 font-sans">{edu.duration}</div>
                    </div>
                    <div className="text-[9.5pt] text-slate-700 font-medium font-sans">
                      {[edu.institution, edu.details].filter(Boolean).join(" | ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research & Projects */}
          {projects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-[10pt] font-bold uppercase tracking-wider text-slate-950">
                {isRtl ? "المشاريع والأعمال" : "PROJECTS & PORTFOLIO"}
              </h2>
              <hr className="border-t border-slate-950 my-1" />
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="space-y-1">
                    <div className="font-bold text-slate-950 text-[10pt]">{proj.title}</div>
                    {proj.technologies && (
                      <div className="text-[9pt] text-slate-600 font-medium font-sans italic">
                        {isRtl ? "الأدوات والتقنيات: " : "Tools & Technologies: "}{proj.technologies}
                      </div>
                    )}
                    {proj.description && (
                      <p className="text-[9.5pt] leading-relaxed text-slate-900 whitespace-pre-line text-justify">{proj.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills & Competencies List */}
          {skills.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-[10pt] font-bold uppercase tracking-wider text-slate-950">
                {isRtl ? "المهارات والتخصصات" : "CORE SKILLS & EXPERTISE"}
              </h2>
              <hr className="border-t border-slate-950 my-1" />
              <div className="text-[9.5pt] leading-relaxed text-slate-900 text-justify pt-1 font-sans">
                {skills.map(s => s.trim()).filter(Boolean).join("  |  ")}
              </div>
            </div>
          )}

          {/* Languages Side */}
          {languages.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-[10pt] font-bold uppercase tracking-wider text-slate-950">
                {isRtl ? "المهارات اللغوية والتقنية" : "TECHNICAL & LANGUAGE SKILLS"}
              </h2>
              <hr className="border-t border-slate-950 my-1" />
              <div className="text-[9.5pt] leading-relaxed text-slate-900 pt-1 font-sans space-y-1.5">
                <div>
                  <strong>{isRtl ? "اللغات: " : "Languages: "}</strong>
                  {languages.map(lang => `${lang.name} (${lang.level})`).join("  •  ")}
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Template 2: MODERN (Sidebar Column collapses on Print) */}
      {selectedTemplate === "modern" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 print:block">
          {/* Left/Sidebar panel */}
          <div className="md:col-span-4 space-y-6 border-b pb-6 md:border-b-0 md:pb-0 md:border-r md:pr-6 print:border-r-0 print:pr-0 print:border-b print:pb-6 print:mb-6 border-slate-200">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{personal.name || "الاسم بالكامل"}</h1>
              <p className="text-sm font-medium text-indigo-600 font-sans uppercase tracking-[0.05em]">{personal.title || "المسمى الوظيفي"}</p>
            </div>

            <div className="space-y-3 font-sans text-xs text-slate-600 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2"><span>✉️</span> <span className="font-mono">{personal.email}</span></div>
              <div className="flex items-center gap-2"><span>📞</span> <span className="font-mono">{personal.phone}</span></div>
              <div className="flex items-center gap-2"><span>📍</span> <span>{personal.location}</span></div>
              <div className="flex items-center gap-2"><span>🔗</span> <span className="font-mono truncate hover:underline">{personal.website}</span></div>
            </div>

            {skills.length > 0 && (
              <div className="space-y-2 border-t pt-4 border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">{isRtl ? "أهم المهارات" : "Key Skills"}</h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((skill, sIdx) => (
                    <span key={sIdx} className="text-[9pt] bg-indigo-50 border border-indigo-100 font-medium text-indigo-700 px-2 py-0.5 rounded">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {languages.length > 0 && (
              <div className="space-y-2 border-t pt-4 border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">{isRtl ? "اللغات" : "Languages"}</h3>
                <div className="space-y-2 pt-1 font-sans">
                  {languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between items-center text-[9pt] text-slate-700 bg-slate-50 border p-1 rounded">
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-[8pt] text-slate-500 font-mono">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Main panel */}
          <div className="md:col-span-8 space-y-6 print:w-full print:block">
            {/* Professional Summary */}
            {personal.summary && (
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">{isRtl ? "النبذة الاحترافية" : "Professional Summary"}</h2>
                <div className="h-[2px] bg-indigo-200 w-10 mt-1 mb-2"></div>
                <p className="text-[10pt] leading-relaxed text-slate-700 whitespace-pre-line">{personal.summary}</p>
              </div>
            )}

            {/* Experience list */}
            {experience.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">{isRtl ? "الخبرات المهنية" : "Professional Experience"}</h2>
                  <div className="h-[2px] bg-indigo-200 w-10 mt-1 mb-2"></div>
                </div>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex justify-between text-[10pt]">
                        <div className="font-bold text-slate-900">{exp.role} @ <span className="text-indigo-600 font-medium">{exp.company}</span></div>
                        <div className="text-xs text-slate-500 font-mono">{exp.duration}</div>
                      </div>
                      <p className="text-[10pt] leading-relaxed text-slate-700 whitespace-pre-line mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">{isRtl ? "التعليم والدراسة" : "Academic Journey"}</h2>
                  <div className="h-[2px] bg-indigo-200 w-10 mt-1 mb-2"></div>
                </div>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id} className="text-[10pt] space-y-0.5">
                      <div className="flex justify-between font-bold text-slate-900">
                        <div>{edu.institution}</div>
                        <div className="text-xs text-slate-500 font-mono">{edu.duration}</div>
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {edu.degree} {edu.details && ` | ${edu.details}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">{isRtl ? "المشاريع والأبحاث" : "Projects & Focus areas"}</h2>
                  <div className="h-[2px] bg-indigo-200 w-10 mt-1"></div>
                </div>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="text-[10pt] space-y-1">
                      <div className="font-bold text-slate-900">{proj.title}</div>
                      {proj.technologies && <p className="text-xs text-slate-500 font-mono">Tools: {proj.technologies}</p>}
                      <p className="text-[10pt] leading-relaxed text-slate-700 whitespace-pre-line">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Template 3: ACADEMIC (Prioritizes Education + Publications/Researches) */}
      {selectedTemplate === "academic" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-slate-900 space-y-1">
            <h1 className="text-3xl font-serif font-bold text-slate-950 uppercase tracking-tight">{personal.name || "Curriculum Vitae"}</h1>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-600">{personal.title || "Academic Researcher"}</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600 font-serif pt-1">
              <span>{personal.phone && `Phone: ${personal.phone}`}</span>
              <span>{personal.email && `Email: ${personal.email}`}</span>
              <span>{personal.location && `Office: ${personal.location}`}</span>
              <span>{personal.website && `URL: ${personal.website}`}</span>
            </div>
          </div>

          {/* Academic Professional Statement */}
          {personal.summary && (
            <div className="space-y-1.5 font-serif">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-0.5">
                {isRtl ? "الملخص البحثي والأكاديمي" : "Research & Teaching Statement"}
              </h2>
              <p className="text-[10pt] leading-relaxed text-slate-800 whitespace-pre-line font-serif">{personal.summary}</p>
            </div>
          )}

          {/* EDUCATION (Academic priority: Rendered first!) */}
          {education.length > 0 && (
            <div className="space-y-3 font-serif">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-0.5">
                {isRtl ? "التعليم الأكاديمي والتحصيل العلمي" : "Academic Hierarchy & Degrees"}
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="space-y-0.5 text-[10pt]">
                    <div className="flex justify-between font-bold text-slate-950">
                      <div>{edu.institution}</div>
                      <div className="text-xs font-mono">{edu.duration}</div>
                    </div>
                    <div className="text-xs text-slate-700 italic">
                      {edu.degree} {edu.details && ` - Area of focus: ${edu.details}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research Publications & Scientific Projects */}
          {projects.length > 0 && (
            <div className="space-y-3 font-serif">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-0.5">
                {isRtl ? "المشاريع والأبحاث والمنشورات العلمية" : "Selected Publications & Scientific Research"}
              </h2>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="text-[10pt] space-y-1">
                    <div className="font-bold text-slate-950">“{proj.title}”</div>
                    {proj.technologies && <p className="text-xs font-mono text-slate-500 italic">Methodologies/Frameworks: {proj.technologies}</p>}
                    <p className="text-[10pt] leading-relaxed text-slate-700 whitespace-pre-line">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work / Teaching Experience */}
          {experience.length > 0 && (
            <div className="space-y-3 font-serif">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-0.5">
                {isRtl ? "الخبرات والتدريس المهني" : "Professional & Teaching Appointments"}
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="space-y-1 text-[10pt]">
                    <div className="flex justify-between font-bold text-slate-950">
                      <div>{exp.role} — <span className="font-normal italic">{exp.company}</span></div>
                      <div className="text-xs font-mono">{exp.duration}</div>
                    </div>
                    <p className="text-[10pt] leading-relaxed text-slate-700 whitespace-pre-line mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages & Core Skills */}
          <div className="grid grid-cols-2 gap-6 border-t pt-4 border-slate-300 font-serif">
            {skills.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{isRtl ? "المؤهلات والأبحاث" : "Domain Expertise & Skills"}</h3>
                <p className="text-[9.5pt] leading-relaxed text-slate-700">{skills.join(" • ")}</p>
              </div>
            )}
            {languages.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{isRtl ? "اللغات" : "Bilingual Masteries"}</h3>
                <div className="space-y-1">
                  {languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between text-[9pt] text-slate-700 pt-0.5">
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-xs font-mono italic">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
