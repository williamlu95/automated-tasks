export default class Page {
  async open(path: string): Promise<void> {
    await browser.url(path);
  }

  async waitAndClick(element: WebdriverIO.Element): Promise<void> {
    console.log(`Waiting and clicking: ${await element.getText()}`);
    await browser.waitUntil(async () => {
      const isClickable = element.isClickable();
      return isClickable;
    });

    await element.click();
  }

  async getElementFromList(elements: WebdriverIO.ElementArray, text: string) {
    await browser.pause(3000);
    const elementTexts = await Promise.all(elements.map((e) => e.getText()));
    const elementIndex = elementTexts.findIndex((e) => e.includes(text));

    if (elementIndex < 0) {
      throw new Error(`Element with text ${text} is not found`);
    }

    return elements[elementIndex];
  }
}
