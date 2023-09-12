import { FC, useState } from "react";
import { faSatelliteDish } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useNotificationContext } from "@app/components/context/Notifications/NotificationProvider";
import { OrgPermissionCan } from "@app/components/permissions";
import { Button } from "@app/components/v2";
import { OrgPermissionActions, OrgPermissionSubjects } from "@app/context";

const INFISICAL_RADAR_GITHUB_URL: string = "https://github.com/settings/installations/41531710";
const PAGE_REDIRECT_TIMEOUT: number = 500;

export const ConfigureInfisicalRadar: FC = () => {
  const { createNotification } = useNotificationContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRedirectToInfisicalRadarApp = (): void => {
    setIsLoading(true);
    let redirectWindow: Window | null = null;

    try {
      createNotification({
        text: "Redirecting to Infisical Radar GitHub app...",
        type: "info"
      });

      redirectWindow = window.open(INFISICAL_RADAR_GITHUB_URL, "_blank", "noopener,noreferrer");

      const redirectTimeout = setTimeout(() => {
        if (redirectWindow) {
          redirectWindow.location.href = INFISICAL_RADAR_GITHUB_URL;
        }
      }, PAGE_REDIRECT_TIMEOUT);

      clearTimeout(redirectTimeout);
      if (redirectWindow) {
        redirectWindow.close();
      }
    } catch (err) {
      console.error("Redirect to Infisical Radar GitHub app failed", err);
      createNotification({
        text: "Redirect to Infisical Radar GitHub app failed",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrgPermissionCan I={OrgPermissionActions.Edit} a={OrgPermissionSubjects.SecretScanning}>
      {(isAllowed: boolean) => (
        <Button
          isLoading={false}
          disabled={!isAllowed || isLoading}
          colorSchema="primary"
          variant="outline_bg"
          type="button"
          leftIcon={<FontAwesomeIcon icon={faSatelliteDish} className="mr-2" />}
          onClick={handleRedirectToInfisicalRadarApp}
        >
          Add more repositories
        </Button>
      )}
    </OrgPermissionCan>
  );
};