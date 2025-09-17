function isInvalidId(id: string) {
  return Number.isNaN(+id);
}

export default isInvalidId;