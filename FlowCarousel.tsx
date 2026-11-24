"use client";

import { useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Dialog,
  DialogContent,
  MobileStepper,
  Button,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

// Constantes de opacidad para overlays
const OVERLAY_OPACITY = {
  dark: "rgba(0, 0, 0, 0.35)",
  darkStrong: "rgba(0, 0, 0, 0.45)",
  light: "rgba(255, 255, 255, 0.15)",
  lightHover: "rgba(255, 255, 255, 0.25)",
} as const;

interface FlowCarouselProps {
  images: string[];
  title: string;
  pdfUrl?: string;
  videoUrl?: string;
}

export const FlowCarousel = ({
  images,
  title,
  pdfUrl,
  videoUrl,
}: FlowCarouselProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const maxSteps = images.length;

  const handleNext = () =>
    setActiveStep((prev) => Math.min(prev + 1, maxSteps - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
    link.click();
  };

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;

    const imgsHtml = images
      .map(
        (src, idx) => `<section class="slide slide-${idx + 1}">
        <img src="${src}" alt="${title} - diapositiva ${idx + 1}" />
      </section>`,
      )
      .join("");

    win.document.write(`<!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            width: 297mm;
            margin: 0;
            padding: 0;
          }

          .slide {
            width: 297mm;
            height: 210mm;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            break-after: page;
            page-break-after: always;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .slide:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          .slide img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          @media print {
            html,
            body {
              width: 100%;
              height: auto;
            }
          }
        </style>
      </head>
      <body>${imgsHtml}</body>
    </html>`);

    win.document.close();

    const printImages = Array.from(win.document.images);

    const waitForImages = async () => {
      await Promise.all(
        printImages.map(async (image) => {
          if (!image.complete) {
            await new Promise<void>((resolve) => {
              image.onload = () => resolve();
              image.onerror = () => resolve();
            });
          }

          if (image.naturalWidth > 0) {
            try {
              await image.decode();
            } catch {
              // La imagen ya terminó de cargar; se continúa con la impresión.
            }
          }
        }),
      );

      if (win.document.fonts?.ready) {
        await win.document.fonts.ready;
      }

      await new Promise<void>((resolve) => {
        win.requestAnimationFrame(() => {
          win.requestAnimationFrame(() => resolve());
        });
      });

      await new Promise((resolve) => win.setTimeout(resolve, 500));

      win.focus();
      win.print();
    };

    void waitForImages();
  };

  if (images.length === 0) return null;

  return (
    <>
      {/* ── Carrusel principal ── */}
      <Box sx={{ width: "100%" }}>
        {/* Imagen activa con botón de zoom */}
        <Box
          onClick={() => setLightboxOpen(true)}
          sx={{
            position: "relative",
            width: "100%",
            cursor: "zoom-in",
            borderRadius: 1.5,
            overflow: "hidden",
            bgcolor: "background.default",
          }}
        >
          <Box
            component="img"
            src={images[activeStep]}
            alt={`${title} – slide ${activeStep + 1}`}
            sx={{
              width: "100%",
              height: "auto",
              display: "block",
              maxHeight: { xs: 260, md: 420 },
              objectFit: "contain",
            }}
          />
          {/* Ícono zoom superpuesto */}
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: OVERLAY_OPACITY.dark,
              borderRadius: 1,
              p: 0.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            <ZoomInIcon sx={{ fontSize: 18, color: "common.white" }} />
          </Box>
        </Box>

        {/* Controles de paginación */}
        <MobileStepper
          variant="dots"
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          sx={{ bgcolor: "transparent", justifyContent: "center", mt: 1 }}
          nextButton={
            <IconButton
              size="small"
              onClick={handleNext}
              disabled={activeStep === maxSteps - 1}
            >
              <ChevronRight />
            </IconButton>
          }
          backButton={
            <IconButton
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              <ChevronLeft />
            </IconButton>
          }
        />

        {/* Contador */}
        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          textAlign="center"
          sx={{ mt: 0.5, mb: pdfUrl ? 1.5 : 0 }}
        >
          {activeStep + 1} / {maxSteps}
        </Typography>

        {/* Botones: imprimir, video y descarga opcional de PDF */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1.5,
            mt: 0.5,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handlePrint}
          >
            Exportar PDF / Imprimir
          </Button>
          {videoUrl && (
            <Button
              variant="outlined"
              size="small"
              color="primary"
              onClick={() => setVideoOpen(true)}
            >
              Ver Video
            </Button>
          )}
          {pdfUrl && (
            <Button
              variant="outlined"
              size="small"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Descargar PDF del flujo
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Lightbox ── */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "grey.900",
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          {/* Cerrar */}
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 10,
              bgcolor: OVERLAY_OPACITY.light,
              color: "primary.main",
              "&:hover": { bgcolor: OVERLAY_OPACITY.lightHover },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Flecha anterior */}
          <IconButton
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              bgcolor: OVERLAY_OPACITY.light,
              color: "primary.main",
              "&:hover": { bgcolor: OVERLAY_OPACITY.lightHover },
              "&.Mui-disabled": { opacity: 0.3, color: "primary.main" },
            }}
          >
            <ChevronLeft sx={{ fontSize: 32 }} />
          </IconButton>

          {/* Imagen ampliada */}
          <Box
            component="img"
            src={images[activeStep]}
            alt={`${title} – slide ${activeStep + 1}`}
            sx={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />

          {/* Flecha siguiente */}
          <IconButton
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
            sx={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              bgcolor: OVERLAY_OPACITY.light,
              color: "primary.main",
              "&:hover": { bgcolor: OVERLAY_OPACITY.lightHover },
              "&.Mui-disabled": { opacity: 0.3, color: "primary.main" },
            }}
          >
            <ChevronRight sx={{ fontSize: 32 }} />
          </IconButton>

          {/* Contador lightbox */}
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              color: "common.white",
              bgcolor: OVERLAY_OPACITY.darkStrong,
              px: 1.5,
              py: 0.25,
              borderRadius: 1,
            }}
          >
            {activeStep + 1} / {maxSteps}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* ── Modal de Video ── */}
      {videoUrl && (
        <Dialog
          open={videoOpen}
          onClose={() => setVideoOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: "grey.900",
              borderRadius: 3,
            },
          }}
        >
          <DialogContent sx={{ p: 0, position: "relative" }}>
            <IconButton
              onClick={() => setVideoOpen(false)}
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 10,
                bgcolor: OVERLAY_OPACITY.light,
                color: "primary.main",
                "&:hover": { bgcolor: OVERLAY_OPACITY.lightHover },
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              component="video"
              controls
              autoPlay
              sx={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: 3,
              }}
            >
              <source src={videoUrl} type="video/mp4" />
              Tu navegador no soporta reproducción de video.
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
