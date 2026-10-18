import type { AwsProduct } from '@/components/aws/AwsPrecisionCard';

export const AWS_PRODUCTS: AwsProduct[] = [
  // ── Row 1 (Initially Visible: 3 Cards) ───────────────────────────────────
  {
    id: 'aws-free-account',
    badge: 'Getting started',
    title: 'Create your free AWS account',
    description: 'Gain instant access to the AWS Free Tier with 12 months of free access to 60+ popular cloud services.',
    pricingTier: '12 Months Free',
    category: 'overview',
  },
  {
    id: 'bedrock-agentcore',
    badge: 'Agentic AI',
    title: 'Amazon Bedrock AgentCore',
    description: 'Build, deploy, and operate highly effective agents securely, at scale using any foundation model and framework — no infrastructure overhead.',
    pricingTier: 'Paid plan exclusive',
    category: 'ai',
  },
  {
    id: 'aws-s3',
    badge: 'Cloud Storage',
    title: 'Amazon Simple Storage (S3)',
    description: 'Object storage built to retrieve any amount of data from anywhere. 5 GB of standard storage with 99.999999999% durability.',
    pricingTier: 'Free Tier eligible',
    category: 'storage',
  },

  // ── Row 2 (Revealed on Show More: Cards 4-6) ─────────────────────────────
  {
    id: 'aws-ec2',
    badge: 'Compute',
    title: 'Amazon EC2 Elastic Compute',
    description: 'Secure, resizable cloud compute capacity. Run containerized workloads, microservices, and serverless clusters on demand.',
    pricingTier: '750 Hours Free',
    category: 'compute',
  },
  {
    id: 'sagemaker-ai',
    badge: 'AI-ML',
    title: 'Amazon SageMaker AI',
    description: 'Machine learning for every data scientist and developer. Build, train, and deploy models with fully managed notebooks and pipelines.',
    pricingTier: 'Available on both plans',
    category: 'ai',
  },
  {
    id: 'dynamodb-serverless',
    badge: 'Database',
    title: 'Amazon DynamoDB NoSQL',
    description: 'Fast, flexible NoSQL database service for single-digit millisecond performance at any scale. Includes 25 GB of free storage.',
    pricingTier: 'Always Free',
    category: 'database',
  },

  // ── Row 3 (Revealed on Show More: Cards 7-9) ─────────────────────────────
  {
    id: 'aws-lambda',
    badge: 'Serverless Compute',
    title: 'AWS Lambda Event Engine',
    description: 'Run code without thinking about servers or clusters. 1,000,000 free requests and 3.2 million seconds of compute time every month.',
    actionText: 'Deploy Function',
    pricingTier: 'Always Free',
    category: 'compute',
  },
  {
    id: 'amazon-q-developer',
    badge: 'Agentic AI',
    title: 'Amazon Q Developer',
    description: 'Generative AI-powered conversational assistant to build applications faster on AWS with intelligent code generation and security audits.',
    pricingTier: 'Free Tier eligible',
    category: 'ai',
  },
  {
    id: 'aurora-serverless',
    badge: 'Databases',
    title: 'Amazon Aurora Serverless',
    description: 'High-performance PostgreSQL and MySQL compatible relational database that automatically starts up, shuts down, and scales capacity.',
    pricingTier: 'Available on both plans',
    category: 'database',
  },
];
