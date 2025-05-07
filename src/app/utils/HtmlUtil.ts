import html2canvas from "html2canvas";
import {IPcs} from "../core/IPcs";
import {EightyEight} from "./EightyEight";

interface TSelectElementExport {
  elt: HTMLElement
  fileName: string
}

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

/*
  static async sav_captureAllPcsComponentSelected(musaicName:boolean = false) {
    const scale = window.devicePixelRatio || 1;
    let selectedElements: TSelectElementExport[] = []

    const parents = document.querySelectorAll("app-pcs.e-selected-marker")
    // console.log(`parents.length = ${parents.length}`)
    for (let i = 0; i < parents.length; i++) {
      let message = ''
      const canvas = parents[i].getElementsByTagName("canvas")
      if (canvas.length > 0) {
        let fileName = canvas[0].getAttribute("ng-reflect-message") ?? `pcs-component-${i + 1}`;
        // console.log(`fileName = ${fileName}`)
        // remove spaces and ( ) [ ]
        fileName = fileName.replace(/[\])}[{(\s+]/g, '');
        if (musaicName) {
          const pcsName = fileName.split('-')[0]
          const pcs = new IPcs({strPcs:pcsName})
          fileName = EightyEight.idNumberOf(pcs)
        }
        selectedElements.push({elt: canvas[0], fileName: fileName})
      }
      const divScore = parents[i].getElementsByTagName("div")
      if (divScore.length > 0) {
        const id = divScore[0].getAttribute("id");
        // a musical score ?
        if (id?.startsWith('paper-')) {
          let fileName = divScore[0].getAttribute("ng-reflect-message") ?? `pcs-component-${i + 1}`;
          // remove spaces and ( ) [ ]
          fileName = fileName.replace(/[\])}[{(\s+]/g, '');
          if (musaicName) {
            const pcsName = fileName.split('-')[0]
            const pcs = new IPcs({strPcs:pcsName})
            fileName = EightyEight.idNumberOf(pcs)
          }
          selectedElements.push({elt: divScore[0], fileName: fileName})
        }
      }
    }

    for (let i = 0; i < selectedElements.length; i++) {
      const element = selectedElements[i] // as HTMLElement //.nativeElement

      const style = window.getComputedStyle(element.elt, null);
      const borderRadius = parseFloat(style.borderRadius) || 0;

      const canvas = await html2canvas(element.elt, {
        backgroundColor: null,
        scale: scale,
        useCORS: true
      });

      // Rounded canvas
      const roundedCanvas = document.createElement('canvas');
      roundedCanvas.width = canvas.width;
      roundedCanvas.height = canvas.height;
      const ctx = roundedCanvas.getContext('2d')!;
      const delta = 1

      if (borderRadius) {
        const path = new Path2D();
        path.roundRect(delta, delta, roundedCanvas.width - delta * 2, roundedCanvas.height - delta * 2, borderRadius * scale);
        ctx.clip(path);
      }
      ctx.save();
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();

      const borderWidth: number = 1
      const borderColor: string = '#333'

      // Draw the border if rounded
      if (borderRadius) {
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.roundRect(delta, delta, roundedCanvas.width - delta * 2, roundedCanvas.height - delta * 2, borderRadius * scale);
        ctx.stroke();
      }

      // download directly
      const link = document.createElement('a');
      link.download = `${element.fileName}.png`;
      link.href = roundedCanvas.toDataURL('image/png');
      link.click();

      // Optional: pause briefly to avoid overlapping downloads
      await this.sleep(300);
    }
  }
*/

  static async captureAllPcsComponentSelected(musaicName:boolean = false) {
    const scale = window.devicePixelRatio || 1;
    let selectedElements: TSelectElementExport[] = []

    function getFileName(elt: HTMLElement, index :number) {
      let fileName = "pcs-" + (elt.getAttribute("data-message") ?? `component-${index + 1}`);
      // console.log(`fileName = ${fileName}`)
      // remove spaces and ( ) [ ]
      fileName = fileName.replace(/[\])}[{(\s+]/g, '');
      if (musaicName) {
        const pcsName = fileName.split('-')[1]
        const pcs = new IPcs({strPcs:pcsName})
        fileName = EightyEight.idMusaicOf(pcs)
      }
      return fileName;
    }

    const parents = document.querySelectorAll("app-pcs.e-selected-marker")
    // console.log(`parents.length = ${parents.length}`)
    for (let i = 0; i < parents.length; i++) {
      let message = ''
      const canvas = parents[i].getElementsByTagName("canvas")
      if (canvas.length > 0 && canvas[0]) {
        const fileName = getFileName(canvas[0], i)
        selectedElements.push({elt: canvas[0], fileName: fileName})
      } else {
        const divScore = parents[i].getElementsByTagName("div")
        if (divScore.length > 0 && divScore[0]) {
          const id = divScore[0].getAttribute("id");
          // a musical score ?
          if (id?.startsWith('paper-')) {
            const fileName = getFileName(divScore[0], i)
            selectedElements.push({elt: divScore[0], fileName: fileName})
          }
        }
      }
    }

    for (let i = 0; i < selectedElements.length; i++) {
      const element = selectedElements[i] // as HTMLElement //.nativeElement

      const canvas = await html2canvas(element.elt, {
        backgroundColor: null,
        scale: scale,
        useCORS: true
      });

      // download directly
      const link = document.createElement('a');
      link.download = `${element.fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      // Optional: pause briefly to avoid overlapping downloads
      await this.sleep(200);
    }
  }


  static sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
