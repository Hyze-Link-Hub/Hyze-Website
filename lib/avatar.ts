export function avatarInitials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "??";
}
