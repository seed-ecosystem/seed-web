import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/modules/core/components/alert-dialog.tsx";
import {useEffect, useState} from "react";
import QRCodeStyling from "qr-code-styling";
import {Input} from "@/modules/core/components/input.tsx";
import {useMediaQuery} from "react-responsive";
import {Button} from "@/modules/core/components/button.tsx";
import {Copy} from "lucide-react";
import {useToast} from "@/hooks/use-toast.ts";
import {launch} from "@/coroutines/launch.ts";

export type ShareChatProps = {
  shareUrl: string;
  close(): void;
}

export function ShareChatContent({shareUrl, close}: ShareChatProps) {
  const [qrCodeContainer, updateQrCodeContainer] = useState<HTMLDivElement | null>();
  const isSM = useMediaQuery({ minWidth: 640 + 1 });

  useEffect(() => {
    if (!qrCodeContainer) return;
    while (qrCodeContainer.firstChild) {
      qrCodeContainer.removeChild(qrCodeContainer.firstChild);
    }
    const qrCode = new QRCodeStyling({
      height: isSM ? 250 : 150,
      width: isSM ? 250 : 150,
      type: "svg",
      data: shareUrl,
      dotsOptions: {
        type: "rounded",
      },
      qrOptions: {
        errorCorrectionLevel: "L",
      },
    });
    qrCode.append(qrCodeContainer);
  }, [qrCodeContainer, isSM, shareUrl]);

  const {toast} = useToast();

  function copy() {
    launch(async () => {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        description: "Share url is copied to clipboard",
      });
    });
  }

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Share Chat</AlertDialogTitle>
          <AlertDialogDescription>Scan QR Code or copy link below</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col w-full">
          <div ref={updateQrCodeContainer} className="flex justify-center w-full my-4"/>
          <div className="flex w-full items-center space-x-2">
            <Input value={shareUrl} className="flex-1" readOnly/>
            <Button variant="outline" size="icon" onClick={copy}><Copy/></Button>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={close}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
