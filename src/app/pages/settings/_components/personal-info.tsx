import {
  CallIcon,
  EmailIcon,
  PencilSquareIcon,
  UserIcon,
} from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Button } from "@/components/ui-elements/button";

export function PersonalInfoForm() {
  return (
    <ShowcaseSection title="Kişisel Bilgiler" className="!p-7">
      <form>
        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="fullName"
            label="Ad Soyad"
            placeholder="Ad Soyad"
            defaultValue="Ad Soyad"
            icon={<UserIcon />}
            iconPosition="left"
            height="sm"
          />

          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="phoneNumber"
            label="Telefon Numarası"
            placeholder="+90 5xx xxx xx xx"
            defaultValue={"+90 5xx xxx xx xx"}
            icon={<CallIcon />}
            iconPosition="left"
            height="sm"
          />
        </div>

        <InputGroup
          className="mb-5.5"
          type="email"
          name="email"
          label="E-posta Adresi"
          placeholder="eposta@ornek.com"
          defaultValue="eposta@ornek.com"
          icon={<EmailIcon />}
          iconPosition="left"
          height="sm"
        />

        <InputGroup
          className="mb-5.5"
          type="text"
          name="username"
          label="Kullanıcı Adı"
          placeholder="kullaniciadi"
          defaultValue="kullaniciadi"
          icon={<UserIcon />}
          iconPosition="left"
          height="sm"
        />

        <TextAreaGroup
          className="mb-5.5"
          label="BİYOGRAFİ"
          placeholder="Biyografinizi buraya yazın"
          icon={<PencilSquareIcon />}
          defaultValue=""
        />

        <div className="flex justify-end gap-3">
          <button
            className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
            type="button"
          >
            İptal
          </button>

          <Button label="Değişiklikleri Kaydet" variant="primary" shape="rounded" size="small" />
        </div>
      </form>
    </ShowcaseSection>
  );
}
