import Breadcrumb from "@/components/Breadcrumb";
import ErrorLayer from "@/components/ErrorLayer";
import MasterLayout from "@/masterLayout/MasterLayout";

export default function NotFound() {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='404' />

        {/* ErrorLayer */}
        <ErrorLayer />
      </MasterLayout>
    </>
  );
}
