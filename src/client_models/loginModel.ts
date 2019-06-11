export class LoginModel {
  public readonly pictureUrls: string[]
  public readonly mainPictureUrl: string

  constructor(pictureUrls: string[], mainPictureUrl: string) {
    this.pictureUrls = pictureUrls
    this.mainPictureUrl = mainPictureUrl
  }
}
