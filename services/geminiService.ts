
import { GoogleGenAI } from "@google/genai";
import { Product, Sale } from "../types";

export const getBusinessInsights = async (products: Product[], sales: Sale[]): Promise<string> => {
  // Fix: Strictly follow initialization guidelines by using process.env.API_KEY directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const prompt = `
    Como experto consultor gastronómico, analiza los siguientes datos de mi negocio de comida rápida:
    
    Productos y Costos:
    ${JSON.stringify(products.map(p => ({
      name: p.name,
      price: p.price,
      estimatedProfit: p.price - (p.fixedCost || p.ingredients.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0))
    })))}
    
    Historial de Ventas Recientes:
    ${JSON.stringify(sales.slice(-10))}

    Por favor, proporciona:
    1. Un análisis de rentabilidad por producto.
    2. Sugerencias para optimizar costos de ingredientes.
    3. Recomendaciones de precios basadas en márgenes saludables (mínimo 40%).
    4. Estrategias para aumentar el ticket promedio.
    
    Responde en español con un tono profesional y motivador. Usa Markdown.
  `;

  try {
    // Fix: Use 'gemini-3-pro-preview' for advanced business reasoning and complex analysis tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // Fix: Access the text property directly on the GenerateContentResponse object.
    return response.text || "No se pudo generar el análisis en este momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con la IA. Verifica tu configuración.";
  }
};
