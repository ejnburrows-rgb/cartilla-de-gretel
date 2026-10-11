import { useEffect } from "react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

// The rejected fake activity sandbox has been retired. Route old saved links
// to the real source-faithful student Workbook instead of displaying prototypes.
export const Route = createLazyFileRoute("/dev-living-workbook")({
  component: RetiredDemoRedirect,
});

function RetiredDemoRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: "/cartilla/leccion/$n", params: { n: "1" }, replace: true });
  }, [navigate]);

  return null;
}
