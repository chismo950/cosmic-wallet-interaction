
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { IconButton, useColorMode, useColorModeValue } from "@chakra-ui/react";

export const ColorModeToggle = () => {
  const { toggleColorMode } = useColorMode();
  const SwitchIcon = useColorModeValue(MoonIcon, SunIcon);
  const text = useColorModeValue("Dark Mode", "Light Mode");

  return (
    <IconButton
      aria-label={`Switch to ${text}`}
      icon={<SwitchIcon />}
      onClick={toggleColorMode}
      variant="ghost"
      size="md"
    />
  );
};
