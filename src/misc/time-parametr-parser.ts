export function parseTimeInput(args: string[]): string {
  const allowedArgs = [
    { argName: 'days', regex: /[0-9]{1,}/g },
    { argName: 'hours', regex: /[0-9]{1,}/g },
    { argName: 'ms', regex: /[0-9]{1,}/g },
    { argName: 'date', regex: /[0-9]{4}-[0-9]{2}-[0-9]{2}/g },
    {
      argName: 'longdate',
      regex: /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}/g,
    },
  ];
  const allowedArgsNames = allowedArgs.map((arg) => arg.argName);
  let time: string = undefined;
  args.forEach((inputArg) => {
    allowedArgsNames.forEach((allowedArgName) => {
      if (inputArg.includes(allowedArgName)) {
        const allowedArg = allowedArgs.find(
          (allowedArg) => allowedArg.argName === allowedArgName,
        );

        const matched = inputArg.match(allowedArg.regex);
        const date = new Date();

        switch (allowedArg.argName) {
          case 'days':
            date.setDate(date.getDate() - parseInt(matched[0]));
            break;
          case 'hours':
            date.setHours(date.getHours() - parseInt(matched[0]));
            break;
          case 'ms':
            date.setMilliseconds(date.getMilliseconds() - parseInt(matched[0]));
            break;
          case 'date':
          case 'longdate':
            date.setTime(Date.parse(matched[0]));
            break;
        }
        time = date.toJSON();
      }
    });
  });

  return time;
}
