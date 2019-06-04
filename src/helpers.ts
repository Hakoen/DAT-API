function getRandomArbitrary(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min)
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export { getRandomArbitrary, toTitleCase }
