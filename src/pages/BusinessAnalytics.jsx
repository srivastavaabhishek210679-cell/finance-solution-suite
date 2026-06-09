import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Users, TrendingUp, Award, Megaphone, Star, AlertTriangle, Crown, Package } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/business-analytics'
const OAPI = 'https://finance-backend-so86.onrender.com/api/v1/orders'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const COLORS = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#14b8a6']
const TIER_COLORS = { Bronze:'#cd7f32', Silver:'#c0c0c0', Gold:'#ffd700', Platinum:'#e5e4e2' }
const PERIODS = [['day','Today'],['week','This Week'],['month','This Month'],['quarter','This Quarter'],['biannual','6 Months'],['annual','This Year']]

export default function BusinessAnalytics() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('annual')
  const [orderPeriod, setOrderPeriod] = useState('annual')
  const [customerData, setCustomerData] = useState(null)
  const [orderData, setOrderData] = useState(null)
  const [tiers, setTiers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('customers')
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [campaignForm, setCampaignForm] = useState({campaign_name:'',campaign_type:'win_back',target_segment:'inactive',discount_percent:10,message:'',start_date:'',end_date:''})
  const [toast, setToast] = useState(null)

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  useEffect(() => { loadAll() }, [])
  useEffect(() => { loadCustomers() }, [period])
  useEffect(() => { loadOrders() }, [orderPeriod])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [cRes, tRes, campRes] = await Promise.all([
        fetch(API+'/customers?period='+period, {headers:getHeaders()}),
        fetch(API+'/tiers', {headers:getHeaders()}),
        fetch(API+'/campaigns', {headers:getHeaders()})
      ])
      const [cData, tData, campData] = await Promise.all([cRes.json(), tRes.json(), campRes.json()])
      setCustomerData(cData.data)
      setTiers(tData.data||[])
      setCampaigns(campData.data||[])
    } catch(e) { console.error(e) }
    await loadOrders()
    setLoading(false)
  }

  const loadCustomers = async () => {
    try {
      const res = await fetch(API+'/customers?period='+period, {headers:getHeaders()})
      const data = await res.json()
      setCustomerData(data.data)
    } catch(e) { console.error(e) }
  }

  const loadOrders = async () => {
    try {
      const res = await fetch(API+'/orders?period='+orderPeriod, {headers:getHeaders()})
      const data = await res.json()
      setOrderData(data.data)
    } catch(e) { console.error(e) }
  }

  const handleCreateCampaign = async () => {
    try {
      const res = await fetch(API+'/campaigns', {method:'POST', headers:getHeaders(), body:JSON.stringify(campaignForm)})
      const data = await res.json()
      if(data.status==='success') { showToast('Campaign created!'); setShowCampaignForm(false); loadAll() }
    } catch(e) { showToast('Failed','error') }
  }

  const getTierForCustomer = (revenue, orderCount) => {
    if (revenue >= 1000000 && orderCount >= 20) return 'Platinum'
    if (revenue >= 500000 && orderCount >= 10) return 'Gold'
    if (revenue >= 100000 && orderCount >= 3) return 'Silver'
    return 'Bronze'
  }

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  const CustomerCard = ({customer, rank, showTier=true}) => {
    const tier = showTier ? getTierForCustomer(parseFloat(customer.total_revenue), parseInt(customer.order_count)) : null
    return (
      <div style={{background:'#0f172a',borderRadius:10,padding:14,display:'flex',alignItems:'center',gap:12,borderLeft:`3px solid ${tier?TIER_COLORS[tier]:'#334155'}`}}>
        <div style={{width:32,height:32,borderRadius:'50%',background:'#1e293b',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b',fontSize:13,fontWeight:700,flexShrink:0}}>{rank}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:'#f1f5f9',fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{customer.customer_name}</div>
          <div style={{color:'#64748b',fontSize:11}}>{customer.customer_email}</div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <div style={{color:'#10b981',fontSize:13,fontWeight:700}}>Rs.{Number(customer.total_revenue).toLocaleString()}</div>
          <div style={{color:'#64748b',fontSize:11}}>{customer.order_count} orders</div>
        </div>
        {tier && <span style={{background:TIER_COLORS[tier]+'25',color:TIER_COLORS[tier],padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:700,flexShrink:0}}>{tier}</span>}
      </div>
    )
  }

  const OrderRow = ({order, rank, highlight}) => (
    <div style={{background:'#0f172a',borderRadius:8,padding:'10px 14px',display:'flex',alignItems:'center',gap:12,borderLeft:`3px solid ${highlight}`}}>
      <span style={{color:'#64748b',fontSize:12,width:20}}>{rank}</span>
      <div style={{flex:1}}>
        <div style={{color:'#3b82f6',fontSize:12,fontWeight:600}}>{order.order_number}</div>
        <div style={{color:'#64748b',fontSize:11}}>{order.customer_name} • {new Date(order.order_date).toLocaleDateString('en-IN')}</div>
      </div>
      <span style={{color:'#f1f5f9',fontSize:13,fontWeight:700}}>Rs.{Number(order.total_amount).toLocaleString()}</span>
      <span style={{background:order.status==='Delivered'?'#10b98120':order.status==='Cancelled'?'#ef444420':'#f59e0b20',color:order.status==='Delivered'?'#10b981':order.status==='Cancelled'?'#ef4444':'#f59e0b',padding:'2px 8px',borderRadius:20,fontSize:10}}>{order.status}</span>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <TrendingUp size={24} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Business Analytics</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Customer insights, order analytics, tiers and campaigns</p></div>
        <button onClick={loadAll} style={{marginLeft:'auto',background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
      </div>

      {/* Tabs */}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex',gap:0}}>
        {[['customers','Customer Analytics',Users],['orders','Order Analytics',Package],['tiers','Customer Tiers',Crown],['campaigns','Campaigns',Megaphone]].map(([id,label,Icon])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #10b981':'2px solid transparent',background:'transparent',color:activeTab===id?'#10b981':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400,display:'flex',alignItems:'center',gap:6}}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>

      <div style={{padding:24}}>

        {/* CUSTOMER ANALYTICS TAB */}
        {activeTab==='customers' && (
          <div>
            {/* Period Filter */}
            <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
              {PERIODS.map(([p,label])=>(
                <button key={p} onClick={()=>setPeriod(p)} style={{padding:'6px 16px',borderRadius:20,border:'1px solid '+(period===p?'#10b981':'#334155'),background:period===p?'#10b98120':'transparent',color:period===p?'#10b981':'#64748b',cursor:'pointer',fontSize:13}}>{label}</button>
              ))}
            </div>

            {loading ? <div style={{textAlign:'center',padding:60,color:'#64748b'}}>Loading analytics...</div> : customerData && (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginBottom:20}}>

                  {/* Top Customers */}
                  <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                      <Star size={16} style={{color:'#ffd700'}}/>
                      <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>Top Customers</h3>
                    </div>
                    <div style={{display:'grid',gap:8}}>
                      {customerData.topCustomers?.length > 0 ? customerData.topCustomers.map((c,i)=><CustomerCard key={i} customer={c} rank={i+1}/>) : <div style={{color:'#64748b',fontSize:13,textAlign:'center',padding:20}}>No data for selected period</div>}
                    </div>
                  </div>

                  {/* Frequent Customers */}
                  <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                      <Users size={16} style={{color:'#10b981'}}/>
                      <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>Frequent Customers</h3>
                      <span style={{background:'#10b98120',color:'#10b981',padding:'2px 8px',borderRadius:20,fontSize:11}}>2+ orders</span>
                    </div>
                    <div style={{display:'grid',gap:8}}>
                      {customerData.frequentCustomers?.length > 0 ? customerData.frequentCustomers.map((c,i)=><CustomerCard key={i} customer={c} rank={i+1}/>) : <div style={{color:'#64748b',fontSize:13,textAlign:'center',padding:20}}>No frequent customers yet</div>}
                    </div>
                  </div>

                  {/* Bottom Customers */}
                  <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                      <TrendingUp size={16} style={{color:'#f59e0b'}}/>
                      <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>Needs Attention</h3>
                      <span style={{background:'#f59e0b20',color:'#f59e0b',padding:'2px 8px',borderRadius:20,fontSize:11}}>Low spend</span>
                    </div>
                    <div style={{display:'grid',gap:8}}>
                      {customerData.bottomCustomers?.length > 0 ? customerData.bottomCustomers.map((c,i)=><CustomerCard key={i} customer={c} rank={i+1}/>) : <div style={{color:'#64748b',fontSize:13,textAlign:'center',padding:20}}>No data</div>}
                    </div>
                  </div>

                  {/* Least Active */}
                  <div style={{background:'#1e293b',border:'1px solid #ef444430',borderRadius:12,padding:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                      <AlertTriangle size={16} style={{color:'#ef4444'}}/>
                      <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>Least Active</h3>
                      <span style={{background:'#ef444420',color:'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11}}>60+ days inactive</span>
                    </div>
                    <div style={{display:'grid',gap:8}}>
                      {customerData.leastActive?.length > 0 ? customerData.leastActive.map((c,i)=>(
                        <div key={i} style={{background:'#0f172a',borderRadius:10,padding:14,borderLeft:'3px solid #ef4444'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <div>
                              <div style={{color:'#f1f5f9',fontSize:13,fontWeight:600}}>{c.customer_name}</div>
                              <div style={{color:'#64748b',fontSize:11}}>Last order: {new Date(c.last_order).toLocaleDateString('en-IN')}</div>
                            </div>
                            <div style={{textAlign:'right'}}>
                              <div style={{color:'#ef4444',fontSize:12}}>{c.total_orders} total orders</div>
                              <div style={{background:'#ef444420',color:'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:10,marginTop:4}}>Win Back</div>
                            </div>
                          </div>
                        </div>
                      )) : <div style={{color:'#64748b',fontSize:13,textAlign:'center',padding:20}}>All customers active!</div>}
                    </div>
                  </div>

                  {/* Average Customers */}
                  <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                      <Award size={16} style={{color:'#3b82f6'}}/>
                      <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>Average Customers</h3>
                    </div>
                    <div style={{display:'grid',gap:8}}>
                      {customerData.avgCustomers?.length > 0 ? customerData.avgCustomers.map((c,i)=><CustomerCard key={i} customer={c} rank={i+1} showTier={false}/>) : <div style={{color:'#64748b',fontSize:13,textAlign:'center',padding:20}}>No data</div>}
                    </div>
                  </div>

                  {/* Premium Benefits Reminder */}
                  <div style={{background:'linear-gradient(135deg,#1e1b4b,#1e293b)',border:'1px solid #6366f130',borderRadius:12,padding:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                      <Crown size={16} style={{color:'#ffd700'}}/>
                      <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>Premium Benefits</h3>
                    </div>
                    <div style={{display:'grid',gap:8}}>
                      {[
                        {tier:'Platinum', benefit:'15% discount + VIP 24/7 support + Express shipping', threshold:'Rs.10L+ spend'},
                        {tier:'Gold', benefit:'10% discount + Dedicated manager + Free shipping', threshold:'Rs.5L+ spend'},
                        {tier:'Silver', benefit:'5% discount + Priority support + Free shipping 5K+', threshold:'Rs.1L+ spend'},
                        {tier:'Bronze', benefit:'Basic support + Order tracking', threshold:'New customer'},
                      ].map((b,i)=>(
                        <div key={i} style={{background:'rgba(255,255,255,0.05)',borderRadius:8,padding:10,borderLeft:`3px solid ${TIER_COLORS[b.tier]}`}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                            <span style={{color:TIER_COLORS[b.tier],fontWeight:700,fontSize:12}}>{b.tier}</span>
                            <span style={{color:'#475569',fontSize:10}}>{b.threshold}</span>
                          </div>
                          <div style={{color:'#94a3b8',fontSize:11}}>{b.benefit}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDER ANALYTICS TAB */}
        {activeTab==='orders' && (
          <div>
            <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
              {PERIODS.map(([p,label])=>(
                <button key={p} onClick={()=>setOrderPeriod(p)} style={{padding:'6px 16px',borderRadius:20,border:'1px solid '+(orderPeriod===p?'#3b82f6':'#334155'),background:orderPeriod===p?'#3b82f620':'transparent',color:orderPeriod===p?'#3b82f6':'#64748b',cursor:'pointer',fontSize:13}}>{label}</button>
              ))}
            </div>

            {orderData && (
              <div>
                {/* Order Stats */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
                  {[
                    {label:'Total Orders', value:orderData.stats?.total_orders||0, color:'#3b82f6'},
                    {label:'Total Revenue', value:'Rs.'+Number(orderData.stats?.total_revenue||0).toLocaleString(), color:'#10b981'},
                    {label:'Avg Order', value:'Rs.'+Math.round(orderData.stats?.avg_order||0).toLocaleString(), color:'#f59e0b'},
                    {label:'Delivered', value:orderData.stats?.delivered||0, color:'#10b981'},
                    {label:'Highest Order', value:'Rs.'+Number(orderData.stats?.max_order||0).toLocaleString(), color:'#10b981'},
                    {label:'Lowest Order', value:'Rs.'+Number(orderData.stats?.min_order||0).toLocaleString(), color:'#f59e0b'},
                    {label:'Cancelled', value:orderData.stats?.cancelled||0, color:'#ef4444'},
                    {label:'Pending', value:orderData.stats?.pending||0, color:'#f59e0b'},
                  ].map((s,i)=>(
                    <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding:14,borderLeft:`3px solid ${s.color}`}}>
                      <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
                      <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Orders Trend Chart */}
                {orderData.ordersTrend?.length > 0 && (
                  <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:20}}>
                    <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Revenue & Orders Trend</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={orderData.ordersTrend.map(r=>({...r, period:new Date(r.period).toLocaleDateString('en-IN',{month:'short',day:'numeric'})}))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                        <XAxis dataKey="period" tick={{fill:'#64748b',fontSize:10}}/>
                        <YAxis tick={{fill:'#64748b',fontSize:10}}/>
                        <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9'}}/>
                        <Legend/>
                        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2}/>
                        <Line type="monotone" dataKey="order_count" name="Orders" stroke="#10b981" strokeWidth={2}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                  {/* Top Orders */}
                  <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                      <Star size={16} style={{color:'#ffd700'}}/>
                      <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>Top Orders</h3>
                    </div>
                    <div style={{display:'grid',gap:8}}>
                      {orderData.topOrders?.map((o,i)=><OrderRow key={i} order={o} rank={i+1} highlight="#10b981"/>)}
                    </div>
                  </div>

                  {/* Low Orders */}
                  <div style={{background:'#1e293b',border:'1px solid #ef444330',borderRadius:12,padding:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                      <AlertTriangle size={16} style={{color:'#ef4444'}}/>
                      <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>Low Orders</h3>
                      <span style={{background:'#ef444420',color:'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:10}}>Below average</span>
                    </div>
                    <div style={{display:'grid',gap:8}}>
                      {orderData.lowOrders?.map((o,i)=><OrderRow key={i} order={o} rank={i+1} highlight="#ef4444"/>)}
                    </div>

                    {/* Boost Campaign Tip */}
                    <div style={{background:'#ef444410',border:'1px solid #ef444430',borderRadius:8,padding:12,marginTop:12}}>
                      <div style={{color:'#ef4444',fontSize:12,fontWeight:600,marginBottom:4}}>Boost Low Orders</div>
                      <div style={{color:'#94a3b8',fontSize:11}}>Create a campaign targeting these customers with discounts to increase order value.</div>
                      <button onClick={()=>{setActiveTab('campaigns');setShowCampaignForm(true);setCampaignForm(f=>({...f,target_segment:'low_order',campaign_type:'frequency_boost'}))}} style={{background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',padding:'6px 12px',cursor:'pointer',fontSize:11,marginTop:8,fontWeight:600}}>Create Boost Campaign</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TIERS TAB */}
        {activeTab==='tiers' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20,marginBottom:24}}>
              {tiers.map((tier,i)=>(
                <div key={i} style={{background:'#1e293b',border:`1px solid ${tier.color}40`,borderRadius:12,padding:24,borderTop:`4px solid ${tier.color}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <Crown size={24} style={{color:tier.color}}/>
                      <span style={{fontSize:20,fontWeight:800,color:tier.color}}>{tier.tier_name}</span>
                    </div>
                    <span style={{background:tier.color+'25',color:tier.color,padding:'4px 12px',borderRadius:20,fontSize:13,fontWeight:700}}>{tier.discount_percent}% OFF</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                    <div style={{background:'#0f172a',borderRadius:8,padding:10}}>
                      <div style={{fontSize:10,color:'#64748b',marginBottom:2}}>MIN SPEND</div>
                      <div style={{fontSize:14,fontWeight:700,color:'#f1f5f9'}}>Rs.{Number(tier.min_order_value).toLocaleString()}</div>
                    </div>
                    <div style={{background:'#0f172a',borderRadius:8,padding:10}}>
                      <div style={{fontSize:10,color:'#64748b',marginBottom:2}}>MIN ORDERS</div>
                      <div style={{fontSize:14,fontWeight:700,color:'#f1f5f9'}}>{tier.min_order_count} orders</div>
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:'#64748b',marginBottom:8,fontWeight:600}}>BENEFITS</div>
                    <div style={{display:'grid',gap:6}}>
                      {(tier.benefits||[]).map((b,j)=>(
                        <div key={j} style={{display:'flex',gap:8,alignItems:'center'}}>
                          <div style={{width:6,height:6,borderRadius:'50%',background:tier.color,flexShrink:0}}></div>
                          <span style={{color:'#94a3b8',fontSize:12}}>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tier Distribution Chart */}
            {customerData && (
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Customer Tier Distribution</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                  <div>
                    {customerData.topCustomers?.map((c,i)=>{
                      const tier = getTierForCustomer(parseFloat(c.total_revenue), parseInt(c.order_count))
                      return (
                        <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #334155'}}>
                          <span style={{color:'#94a3b8',fontSize:13}}>{c.customer_name}</span>
                          <span style={{background:TIER_COLORS[tier]+'25',color:TIER_COLORS[tier],padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>{tier}</span>
                        </div>
                      )
                    })}
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={Object.entries(
                        (customerData.topCustomers||[]).reduce((acc,c)=>{
                          const t = getTierForCustomer(parseFloat(c.total_revenue), parseInt(c.order_count))
                          acc[t] = (acc[t]||0)+1; return acc
                        },{})
                      ).map(([name,value])=>({name,value}))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                        {Object.keys(TIER_COLORS).map((t,i)=><Cell key={i} fill={TIER_COLORS[t]}/>)}
                      </Pie>
                      <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9'}}/>
                      <Legend/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CAMPAIGNS TAB */}
        {activeTab==='campaigns' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{color:'#f1f5f9',margin:0,fontSize:16}}>Active Campaigns</h2>
              <button onClick={()=>setShowCampaignForm(true)} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13}}>+ New Campaign</button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16,marginBottom:24}}>
              {campaigns.map((c,i)=>(
                <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div>
                      <h3 style={{color:'#f1f5f9',margin:'0 0 4px',fontSize:15}}>{c.campaign_name}</h3>
                      <div style={{display:'flex',gap:6}}>
                        <span style={{background:'#3b82f620',color:'#3b82f6',padding:'2px 8px',borderRadius:20,fontSize:11}}>{c.campaign_type}</span>
                        <span style={{background:'#8b5cf620',color:'#8b5cf6',padding:'2px 8px',borderRadius:20,fontSize:11}}>{c.target_segment}</span>
                      </div>
                    </div>
                    <span style={{background:'#10b98120',color:'#10b981',padding:'4px 12px',borderRadius:20,fontSize:14,fontWeight:700}}>{c.discount_percent}% OFF</span>
                  </div>
                  <p style={{color:'#94a3b8',fontSize:13,margin:'0 0 12px',lineHeight:1.5}}>{c.message}</p>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748b'}}>
                    <span>From: {c.start_date ? new Date(c.start_date).toLocaleDateString('en-IN') : 'N/A'}</span>
                    <span>To: {c.end_date ? new Date(c.end_date).toLocaleDateString('en-IN') : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Campaign Tips */}
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Campaign Strategy Guide</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
                {[
                  {type:'Win Back', target:'Inactive customers (60+ days)', tip:'Offer 20-25% discount with urgency (30-day expiry). Personal message works best.', color:'#ef4444'},
                  {type:'Frequency Boost', target:'Low order customers', tip:'Reward multiple orders in a period. "3 orders this month = 15% off" drives repeat purchases.', color:'#f59e0b'},
                  {type:'Premium Reward', target:'Gold/Platinum customers', tip:'Exclusive deals, early access, birthday bonuses. Keep your best customers loyal.', color:'#ffd700'},
                  {type:'First Order', target:'New/prospect customers', tip:'25% off first order removes hesitation. Cost of acquisition vs lifetime value.', color:'#10b981'},
                ].map((t,i)=>(
                  <div key={i} style={{background:'#0f172a',borderRadius:8,padding:14,borderLeft:`3px solid ${t.color}`}}>
                    <div style={{color:t.color,fontWeight:600,fontSize:13,marginBottom:4}}>{t.type}</div>
                    <div style={{color:'#64748b',fontSize:11,marginBottom:6}}>Target: {t.target}</div>
                    <div style={{color:'#94a3b8',fontSize:12}}>{t.tip}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCampaignForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowCampaignForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:500}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#f1f5f9',margin:'0 0 20px',fontSize:16}}>Create Campaign</h2>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Campaign Name</label><input value={campaignForm.campaign_name} onChange={e=>setCampaignForm({...campaignForm,campaign_name:e.target.value})} style={inputStyle}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Type</label>
                  <select value={campaignForm.campaign_type} onChange={e=>setCampaignForm({...campaignForm,campaign_type:e.target.value})} style={inputStyle}>
                    {['win_back','frequency_boost','premium_reward'].map(t=><option key={t}>{t}</option>)}
                  </select></div>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Target Segment</label>
                  <select value={campaignForm.target_segment} onChange={e=>setCampaignForm({...campaignForm,target_segment:e.target.value})} style={inputStyle}>
                    {['inactive','low_order','frequent','premium'].map(s=><option key={s}>{s}</option>)}
                  </select></div>
              </div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Discount %</label><input type="number" value={campaignForm.discount_percent} onChange={e=>setCampaignForm({...campaignForm,discount_percent:parseFloat(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Message</label><textarea value={campaignForm.message} onChange={e=>setCampaignForm({...campaignForm,message:e.target.value})} rows={3} style={{...inputStyle,resize:'vertical'}}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Start Date</label><input type="date" value={campaignForm.start_date} onChange={e=>setCampaignForm({...campaignForm,start_date:e.target.value})} style={inputStyle}/></div>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>End Date</label><input type="date" value={campaignForm.end_date} onChange={e=>setCampaignForm({...campaignForm,end_date:e.target.value})} style={inputStyle}/></div>
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowCampaignForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreateCampaign} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Launch Campaign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}