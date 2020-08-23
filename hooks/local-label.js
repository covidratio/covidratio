const { useContext, useMemo } = require("react");
const { default: AppContext } = require("../context/app");

function useLocaleLabel(labels) {
  const [app] = useContext(AppContext);

  return useMemo(() => {
    if (app.languages.length === 0) {
      return null;
    }

    const labelMap = labels.reduce((map, { language, value }) => map.set(language, value), new Map());

    const language = app.languages.find((lang) => labelMap.has(lang));

    return language ? labelMap.get(language) : null;
  }, [
    app.languages,
    labels,
  ]);
}

export default useLocaleLabel;
