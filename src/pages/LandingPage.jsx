import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{minHeight:'100vh',background:'#0a0f1e',color:'#f1f5f9',fontFamily:'Inter,sans-serif',overflowX:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --accent: #00e5b0; --accent2: #7c6fff; --ink: #0a0f1e;
          --ink2: #141929; --ink3: #1e2740; --ink4: #2a3555;
          --muted: #64748b; --muted2: #94a3b8; --border: rgba(255,255,255,0.07);
        }
        .syne { font-family: 'Syne', sans-serif; }
        .grad { background: linear-gradient(135deg, #00e5b0, #7c6fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .module-card { background:#141929; border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:18px; transition:all 0.2s; cursor:default; }
        .module-card:hover { border-color:rgba(0,229,176,0.3); transform:translateY(-2px); }
        .who-card { background:#141929; border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:28px; transition:border-color 0.2s; }
        .who-card:hover { border-color:rgba(124,111,255,0.4); }
        .pricing-card { background:#141929; border:1px solid rgba(255,255,255,0.07); border-radius:16px; padding:28px; position:relative; transition:transform 0.2s; }
        .pricing-card:hover { transform:translateY(-4px); }
        .pricing-card.featured { border-color:#00e5b0; background:linear-gradient(135deg,rgba(0,229,176,0.05),#141929); }
        .btn-primary { background:#00e5b0; color:#0a0f1e; padding:14px 32px; border-radius:10px; font-weight:700; font-size:15px; border:none; cursor:pointer; transition:all 0.2s; box-shadow:0 0 32px rgba(0,229,176,0.25); display:inline-flex; align-items:center; gap:8px; }
        .btn-primary:hover { background:#00ffcc; transform:translateY(-2px); box-shadow:0 0 48px rgba(0,229,176,0.4); }
        .btn-secondary { background:rgba(255,255,255,0.06); color:#f1f5f9; border:1px solid rgba(255,255,255,0.12); padding:14px 32px; border-radius:10px; font-weight:600; font-size:15px; cursor:pointer; transition:background 0.2s; }
        .btn-secondary:hover { background:rgba(255,255,255,0.1); }
        .check { color:#00e5b0; font-weight:700; }
        .cross { color:#64748b; }
        .preview-bar-item { flex:1; border-radius:3px 3px 0 0; background:linear-gradient(to top,#00e5b0,#7c6fff); opacity:0.7; }
        .nav-link { color:#94a3b8; text-decoration:none; font-size:14px; font-weight:500; transition:color 0.2s; cursor:pointer; background:none; border:none; }
        .nav-link:hover { color:#f1f5f9; }
        .tag { background:rgba(124,111,255,0.1); color:#a89bff; border:1px solid rgba(124,111,255,0.2); padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500; }
        .feature-icon { width:44px; height:44px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:20px; }
        .cta-btn { background:#00e5b0; color:#0a0f1e; padding:14px 36px; border-radius:10px; font-weight:700; font-size:16px; border:none; cursor:pointer; transition:all 0.2s; box-shadow:0 0 40px rgba(0,229,176,0.3); }
        .cta-btn:hover { background:#00ffcc; transform:translateY(-2px); }
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 48px',background:'rgba(10,15,30,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        <div className="syne" style={{fontSize:22,fontWeight:800,background:'linear-gradient(135deg,#00e5b0,#7c6fff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Deemona</div>
        <div style={{display:'flex',gap:32,alignItems:'center'}}>
          <a href="#modules" className="nav-link">Modules</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#who" className="nav-link">Who It's For</a>
          <button onClick={()=>navigate('/login')} className="nav-link" style={{background:'rgba(0,229,176,0.1)',border:'1px solid rgba(0,229,176,0.3)',color:'#00e5b0',padding:'8px 20px',borderRadius:8,fontWeight:700}}>Login</button>
          <button onClick={()=>navigate('/register')} style={{background:'#00e5b0',border:'none',color:'#0a0f1e',padding:'9px 22px',borderRadius:8,fontWeight:700,fontSize:13,cursor:'pointer'}}>Get Started →</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 24px 80px',position:'relative',overflow:'hidden'}}>
        {/* Grid bg */}
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(0,229,176,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,176,0.04) 1px,transparent 1px)',backgroundSize:'48px 48px',maskImage:'radial-gradient(ellipse 80% 60% at 50% 50%,black 20%,transparent 100%)'}}></div>
        <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:600,height:300,background:'radial-gradient(ellipse,rgba(0,229,176,0.12) 0%,transparent 70%)',pointerEvents:'none'}}></div>

        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(0,229,176,0.08)',border:'1px solid rgba(0,229,176,0.2)',borderRadius:100,padding:'6px 16px',marginBottom:28,fontSize:13,color:'#00e5b0',fontWeight:600,position:'relative',zIndex:1}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'#00e5b0',display:'inline-block',animation:'pulse 2s infinite'}}></span>
          Now Live — 23 Modules, One Platform
        </div>

        <h1 className="syne" style={{fontSize:'clamp(42px,7vw,80px)',fontWeight:800,lineHeight:1.05,letterSpacing:-2,maxWidth:900,marginBottom:24,position:'relative',zIndex:1}}>
          Run Your Entire Business.<br/>
          <span className="grad">One Dashboard.</span>
        </h1>

        <p style={{fontSize:19,color:'#94a3b8',maxWidth:580,margin:'0 auto 40px',fontWeight:400,lineHeight:1.65,position:'relative',zIndex:1}}>
          Deemona replaces 10+ disconnected tools with a single modern platform — from payroll to projects, CRM to compliance. Built for Indian SMEs who outgrew spreadsheets.
        </p>

        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',position:'relative',zIndex:1}}>
          <button className="btn-primary" onClick={()=>navigate('/register')}>Start Free Trial →</button>
          <button className="btn-secondary" onClick={()=>navigate('/login')}>Login to App</button>
        </div>

        <div style={{display:'flex',gap:48,justifyContent:'center',marginTop:64,flexWrap:'wrap',position:'relative',zIndex:1}}>
          {[['23','Business Modules'],['500+','Built-in Reports'],['100+','Database Tables'],['61','Live KPIs']].map(([num,label])=>(
            <div key={label} style={{textAlign:'center'}}>
              <div className="syne" style={{fontSize:36,fontWeight:800,color:'#00e5b0',lineHeight:1}}>{num}</div>
              <div style={{fontSize:13,color:'#64748b',marginTop:4}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MODULES */}
      <section id="modules" style={{padding:'96px 24px',maxWidth:1200,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#00e5b0',marginBottom:12}}>Every Department Covered</div>
          <h2 className="syne" style={{fontSize:'clamp(32px,4vw,48px)',fontWeight:800,letterSpacing:-1,marginBottom:16}}>23 Modules. Zero Gaps.</h2>
          <p style={{fontSize:17,color:'#94a3b8',maxWidth:560,margin:'0 auto'}}>From the moment you hire someone to the day a contract closes — every workflow lives here.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
          {[
            ['💰','Payroll Management','Automate salary runs, payslips and deductions'],
            ['📋','Project Management','Kanban boards, timelines and team tracking'],
            ['🧑‍💼','HR & Resources','Employee profiles, roles and availability'],
            ['📅','Leave Management','Apply, approve and track all leave types'],
            ['⏰','Attendance','Daily check-in, overtime and bulk marking'],
            ['🏷️','Budget Management','Department budgets, spend tracking, variance'],
            ['🧾','Expense Management','Claim, approve and reimburse expenses'],
            ['📦','Inventory','Stock levels, reorder alerts, valuation'],
            ['🚚','Vendor Management','Supplier ratings, payment terms, blacklisting'],
            ['📄','Contracts','Track contracts, renewals and expiry alerts'],
            ['🛒','Order Management','Order lifecycle, payments and customer tracking'],
            ['🔗','Supply Management','Purchase orders and supplier pipeline'],
            ['👥','CRM / Customers','Leads, pipeline kanban and deal tracking'],
            ['📈','Sales Pipeline','Deals, win rates and revenue forecasting'],
            ['🎯','Performance','Reviews, goal tracking and ratings'],
            ['🎓','Training','Courses, enrollments and certifications'],
            ['✈️','Travel Management','Travel requests, approvals and cost tracking'],
            ['⚠️','Risk Management','Risk register, heat maps and mitigation plans'],
            ['🛡️','Compliance','Regulatory tracking and audit readiness'],
            ['🗂️','Document Management','Centralised file store with version control'],
            ['🎫','Helpdesk','Internal tickets, priorities and SLA tracking'],
            ['🏗️','Asset Management','Track assets, depreciation and warranties'],
            ['🔍','Recruitment','Job postings, applicant pipeline and hiring'],
          ].map(([icon,name,desc])=>(
            <div key={name} className="module-card">
              <div style={{fontSize:24,marginBottom:10}}>{icon}</div>
              <div style={{fontSize:13,fontWeight:600,color:'#f1f5f9',marginBottom:4}}>{name}</div>
              <div style={{fontSize:11,color:'#64748b',lineHeight:1.5}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <div id="features" style={{background:'#141929',padding:'96px 24px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#00e5b0',marginBottom:12}}>Platform Capabilities</div>
          <h2 className="syne" style={{fontSize:'clamp(32px,4vw,48px)',fontWeight:800,letterSpacing:-1,marginBottom:16}}>Built for How<br/>Businesses Actually Work</h2>
          <p style={{fontSize:17,color:'#94a3b8',maxWidth:560,marginBottom:56}}>A system that surfaces insight, automates routine tasks and keeps your team moving.</p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}}>
            <div style={{display:'grid',gap:24}}>
              {[
                ['📊','rgba(0,229,176,0.1)','Live Dashboard with 61 KPIs','Real-time metrics across all 23 modules stream into one unified command centre. No refresh needed.'],
                ['📋','rgba(124,111,255,0.1)','500+ Built-in Reports','Every module ships with pre-built reports across 13 domains. Export to CSV in one click.'],
                ['🔔','rgba(245,158,11,0.1)','Approval Workflows & Notifications','Multi-level approvals for expenses, leaves and POs. Broadcast alerts to all users instantly.'],
                ['🔐','rgba(255,107,107,0.1)','Role-based Access Control','Admin, Manager, User, Viewer — granular permissions per module per person.'],
                ['🔌','rgba(20,184,166,0.1)','Webhooks & API Integration','Connect to any external system. 11 event types, retry logic and delivery logs.'],
                ['🛡️','rgba(0,229,176,0.1)','Superuser Admin Panel','Impersonate users, broadcast notices, manage billing plans and monitor DB health.'],
              ].map(([icon,bg,title,desc])=>(
                <div key={title} style={{display:'flex',gap:16,alignItems:'flex-start'}}>
                  <div className="feature-icon" style={{background:bg}}>{icon}</div>
                  <div>
                    <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>{title}</div>
                    <div style={{fontSize:13,color:'#94a3b8',lineHeight:1.55}}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard preview */}
            <div style={{background:'#1e2740',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:24,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,background:'radial-gradient(circle,rgba(0,229,176,0.08),transparent 70%)'}}></div>
              <div style={{display:'flex',gap:6,marginBottom:16}}>
                {['#ef4444','#f59e0b','#10b981'].map(c=><div key={c} style={{width:10,height:10,borderRadius:'50%',background:c}}></div>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                {[['₹48.2L','Monthly Revenue','#00e5b0'],['247','Active Orders','#7c6fff'],['94%','Attendance Rate','#f59e0b'],['3','Pending Approvals','#ff6b6b']].map(([num,label,color])=>(
                  <div key={label} style={{background:'#2a3555',borderRadius:8,padding:12,borderLeft:`3px solid ${color}`}}>
                    <div style={{fontSize:18,fontWeight:700,color,marginBottom:2}}>{num}</div>
                    <div style={{fontSize:9,color:'#64748b'}}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{background:'#2a3555',borderRadius:8,padding:12,height:90,display:'flex',alignItems:'flex-end',gap:6}}>
                {[45,65,50,80,70,90,75].map((h,i)=>(
                  <div key={i} className="preview-bar-item" style={{height:h+'%'}}></div>
                ))}
              </div>
              <div style={{marginTop:10,fontSize:10,color:'#475569',textAlign:'center'}}>Revenue trend — last 7 months</div>
            </div>
          </div>
        </div>
      </div>

      {/* WHO BENEFITS */}
      <section id="who" style={{padding:'96px 24px',maxWidth:1200,margin:'0 auto'}}>
        <div style={{fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#00e5b0',marginBottom:12}}>Target Market</div>
        <h2 className="syne" style={{fontSize:'clamp(32px,4vw,48px)',fontWeight:800,letterSpacing:-1,marginBottom:16}}>Built for Every Industry<br/>That Runs on Operations</h2>
        <p style={{fontSize:17,color:'#94a3b8',maxWidth:560,marginBottom:48}}>Any business with employees, vendors and customers can replace 10 tools with Deemona.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:20}}>
          {[
            ['🏭','Manufacturing','Track raw materials, supplier POs, machine assets and shift attendance — all in one place.',['Inventory','Supply','Assets','Payroll']],
            ['💻','IT & Software','Manage sprints, resource utilisation, client contracts and internal helpdesk tickets seamlessly.',['Projects','Resources','Contracts','Helpdesk']],
            ['🏢','Trading & Distribution','From purchase orders to customer invoices — manage the full buy-sell cycle with real-time stock.',['Orders','Inventory','CRM','Vendors']],
            ['🏥','Healthcare & Clinics','Handle staff rosters, medical compliance, equipment tracking and vendor management.',['Compliance','HR','Assets','Attendance']],
            ['🏗️','Real Estate & Construction','Track project milestones, subcontractor agreements, site assets and budget variances.',['Projects','Contracts','Budget','Vendors']],
            ['🎓','Education Institutions','Manage faculty payroll, training records, compliance audits and facility asset registers.',['Payroll','Training','Compliance','Assets']],
          ].map(([icon,title,desc,tags])=>(
            <div key={title} className="who-card">
              <div style={{fontSize:32,marginBottom:14}}>{icon}</div>
              <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>{title}</div>
              <div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6,marginBottom:14}}>{desc}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {tags.map(t=><span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{padding:'0 24px 96px',maxWidth:1200,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#00e5b0',marginBottom:12}}>Why Deemona</div>
          <h2 className="syne" style={{fontSize:'clamp(32px,4vw,48px)',fontWeight:800,letterSpacing:-1,marginBottom:16}}>The Alternative to Paying<br/>₹5 Lakh/Year for SAP</h2>
        </div>
        <div style={{background:'#141929',borderRadius:14,overflow:'hidden',border:'1px solid rgba(255,255,255,0.07)'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#1e2740'}}>
                {['Capability','Deemona','SAP Business One','Zoho One','Tally'].map((h,i)=>(
                  <th key={h} style={{padding:'16px 20px',textAlign:'left',fontSize:13,fontWeight:600,color:i===1?'#00e5b0':'#94a3b8',borderBottom:'1px solid rgba(255,255,255,0.07)',background:i===1?'rgba(0,229,176,0.05)':'transparent'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['All-in-one platform','✓','✓','✓','✗'],
                ['Modern, fast UI','✓','✗','✓','✗'],
                ['Flat monthly pricing','✓','✗','✗ (per user)','✗'],
                ['Live KPI dashboard','✓','✓','✓','✗'],
                ['SME-friendly setup','✓','✗','✓','✓'],
                ['India-first design','✓','✗','Partial','✓'],
                ['Starting price/month','₹2,000','₹25,000+','₹3,000/user','₹1,500'],
              ].map((row,ri)=>(
                <tr key={ri} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  {row.map((cell,ci)=>(
                    <td key={ci} style={{padding:'13px 20px',fontSize:13,background:ci===1?'rgba(0,229,176,0.03)':'transparent',color:ci===0?'#f1f5f9':cell==='✓'?'#00e5b0':cell==='✗'?'#64748b':ci===1?'#00e5b0':ri===6?'#94a3b8':'#94a3b8',fontWeight:ci===0?500:ci===1&&ri===6?700:400}}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PRICING */}
      <div id="pricing" style={{background:'#141929',padding:'96px 24px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#00e5b0',marginBottom:12}}>Simple Pricing</div>
          <h2 className="syne" style={{fontSize:'clamp(32px,4vw,48px)',fontWeight:800,letterSpacing:-1,marginBottom:16}}>Flat Rate. No Surprises.</h2>
          <p style={{fontSize:17,color:'#94a3b8',marginBottom:48}}>Pay per company, not per user. Scale your team without scaling your bill.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:20,textAlign:'left'}}>
            {[
              {plan:'Starter',price:'₹2,000',desc:'For small teams getting started',features:['Up to 10 users','8 core modules','Live dashboard','CSV export','Email support'],featured:false},
              {plan:'Professional',price:'₹5,000',desc:'For growing businesses that need everything',features:['Up to 50 users','All 23 modules','500+ reports','Webhooks & API','Approval workflows','Priority support'],featured:true},
              {plan:'Enterprise',price:'₹12,000',desc:'For large teams needing full control',features:['Unlimited users','All modules + Admin Panel','Custom branding','Dedicated instance','SLA guarantee','Onboarding support'],featured:false},
            ].map(({plan,price,desc,features,featured})=>(
              <div key={plan} className={`pricing-card${featured?' featured':''}`}>
                {featured && <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'#00e5b0',color:'#0a0f1e',padding:'4px 14px',borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>Most Popular</div>}
                <div style={{fontSize:13,fontWeight:600,color:'#94a3b8',marginBottom:8,textTransform:'uppercase',letterSpacing:1}}>{plan}</div>
                <div className="syne" style={{fontSize:36,fontWeight:800,lineHeight:1,marginBottom:4}}>{price} <span style={{fontSize:14,fontWeight:400,color:'#64748b',fontFamily:'Inter,sans-serif'}}>/month</span></div>
                <div style={{fontSize:13,color:'#94a3b8',marginBottom:20}}>{desc}</div>
                <ul style={{listStyle:'none',display:'grid',gap:10,marginBottom:24}}>
                  {features.map(f=>(
                    <li key={f} style={{display:'flex',gap:8,fontSize:13,alignItems:'center'}}>
                      <span style={{color:'#00e5b0',fontWeight:700}}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={()=>navigate('/register')} style={{display:'block',width:'100%',padding:12,borderRadius:8,fontWeight:600,fontSize:14,cursor:'pointer',border:'none',background:featured?'#00e5b0':'rgba(255,255,255,0.06)',color:featured?'#0a0f1e':'#f1f5f9',transition:'all 0.2s'}}>
                  {featured?'Start Free Trial':'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{textAlign:'center',padding:'96px 24px',background:'linear-gradient(135deg,rgba(0,229,176,0.05),rgba(124,111,255,0.05))',borderTop:'1px solid rgba(255,255,255,0.07)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        <div style={{fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#00e5b0',marginBottom:12}}>Get Started Today</div>
        <h2 className="syne" style={{fontSize:'clamp(32px,4vw,48px)',fontWeight:800,letterSpacing:-1,maxWidth:600,margin:'0 auto 16px'}}>Your Business Runs on 10 Tools.<br/>It Doesn't Have To.</h2>
        <p style={{color:'#94a3b8',fontSize:17,marginBottom:36}}>Start free — no credit card, no setup fees, no consultants required.</p>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <button className="cta-btn" onClick={()=>navigate('/register')}>Create Free Account →</button>
          <button className="btn-secondary" onClick={()=>navigate('/login')}>Sign In</button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{textAlign:'center',padding:'40px 24px',borderTop:'1px solid rgba(255,255,255,0.07)',fontSize:13,color:'#64748b'}}>
        <div className="syne" style={{fontSize:20,fontWeight:800,background:'linear-gradient(135deg,#00e5b0,#7c6fff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:12}}>Deemona</div>
        <p style={{marginBottom:8}}>Enterprise Finance Solution Suite — Built for Indian SMEs</p>
        <p style={{color:'#334155'}}>© 2026 Deemona. All rights reserved.</p>
      </footer>
    </div>
  )
}