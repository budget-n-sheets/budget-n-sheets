class HtmlTemplate2 {
  constructor (htmlTemplate) {
    this.htmlTemplate = htmlTemplate;
  }

  assignReservedHref () {
    const reservedHref = {
      home_developer: 'https://www.budgetnsheets.com',
      home_app: 'https://www.budgetnsheets.com',
      home_help: 'https://www.budgetnsheets.com/support',
      privacy_policy: 'https://www.budgetnsheets.com/privacy-policy',
      terms_of_service: 'https://www.budgetnsheets.com/terms-of-service',
      join_forum: 'https://groups.google.com/g/add-on-budget-n-sheets-forum',
      send_feedback: 'https://www.budgetnsheets.com/contact',
      home_wiki: 'https://github.com/guimspace/budget-n-sheets/wiki',
      g_marketplace: 'https://gsuite.google.com/marketplace/app/budget_n_sheets/628594713587'
    };

    for (const key in reservedHref) {
      this.htmlTemplate[key] = reservedHref[key];
    }

    return this;
  }

  evaluate () {
    return this.htmlTemplate.evaluate();
  }

  getRawContent () {
    return this.htmlTemplate.getRawContent();
  }

  setScriptletValues (values) {
    for (const key in values) {
      this.htmlTemplate[key] = values[key];
    }

    return this;
  }
}
