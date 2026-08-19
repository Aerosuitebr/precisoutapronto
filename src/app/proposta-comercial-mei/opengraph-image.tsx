import { ImageResponse } from 'next/og';
export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:72,color:'#f8fafc',background:'linear-gradient(135deg,#020617,#0f3347)'}}><div style={{display:'flex',fontSize:25,fontWeight:800,color:'#fde68a'}}>PRECISOU, TÁ PRONTO · PROPOSTA PARA MEI</div><div style={{display:'flex',maxWidth:1030,fontSize:64,lineHeight:1.06,fontWeight:850}}>Apresente valor, escopo e próximo passo com confiança.</div><div style={{display:'flex',fontSize:25,color:'#cbd5e1'}}>Modelo organizado · edição online · PDF</div></div>, size);
}
