import React from 'react';

const StepContent = ({ step }) => {
  const IconComponent = step.icon;

  return (
    <div className={`p-8 rounded-2xl ${step.bgColor} border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center mb-6">
        <div className={`p-3 rounded-xl ${step.bgColor} mr-4`}>
          <IconComponent className={`h-8 w-8 ${step.color}`} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{step.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">{step.subtitle}</p>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">{step.description}</p>

      {step.features && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {step.features.map((feature, index) => (
              <div key={index} className="flex items-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <feature.icon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step.example && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{step.example.title}</h3>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            {step.example.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{item.name || item.url}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.url || item.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step.integrations && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {step.integrations.map((integration, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div className="text-2xl mb-2">{integration.icon}</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{integration.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{integration.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {step.nextSteps && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Next Steps</h3>
          <div className="space-y-3">
            {step.nextSteps.map((s, index) => (
              <div key={index} className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>
                <span className="text-gray-700 dark:text-gray-300">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StepContent;

