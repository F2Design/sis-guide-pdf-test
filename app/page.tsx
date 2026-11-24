import { FlowCarousel } from "../FlowCarousel";

export default function Home() {
  return (
    <main style={{ maxWidth: 1200, margin: "40px auto", padding: 24 }}>
      <h1>Prueba de impresión PDF</h1>

      <FlowCarousel
        title="Órdenes de Trabajo"
        images={[
          "/flows/work-orders/26.jpg",
          "/flows/work-orders/27.jpg",
          "/flows/work-orders/28.jpg",
          "/flows/work-orders/29.jpg",
        ]}
      />
    </main>
  );
}
