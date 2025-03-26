
export class HtmlUtil {

  static gotoTopPage() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth"
    })
  }

  static gotoAnchor(anchor: string) {
      const elt =document.getElementById(anchor)
      if (elt) {
        // goto result
        setTimeout(() =>
          elt.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest"
          }), 500
        )
      }
    }


}
