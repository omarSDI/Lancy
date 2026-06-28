"""
Lansy.ai — RAG Service
LangChain + ChromaDB for retrieving relevant CV examples as context.
"""

import logging

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import settings

logger = logging.getLogger(__name__)

# ChromaDB client (lazy initialization)
_client = None
_collection = None

COLLECTION_NAME = "cv_examples"

# Sample CV bullet points for seeding (French and English)
SEED_DATA = [
    # --- French: IT / Software Engineering ---
    "Développé et déployé une application web full-stack avec React, Node.js et PostgreSQL, servant plus de 10 000 utilisateurs actifs mensuels.",
    "Conçu et implémenté une API RESTful avec FastAPI, réduisant le temps de réponse de 45% grâce à la mise en cache Redis.",
    "Dirigé une équipe Agile de 5 développeurs pour livrer un système de gestion de contenu en 3 mois.",
    "Optimisé les requêtes SQL, réduisant le temps de chargement des rapports de 60% sur une base PostgreSQL de 2M+ enregistrements.",
    "Mis en place un pipeline CI/CD avec GitHub Actions et Docker, automatisant 100% du processus de déploiement.",
    "Intégré des modèles d'IA (GPT, BERT) dans l'application pour automatiser le traitement de documents, gain de productivité de 30%.",
    "Développé des microservices en Python/FastAPI avec une architecture événementielle utilisant RabbitMQ.",
    "Implémenté un système d'authentification OAuth 2.0 / JWT sécurisé avec gestion des rôles et permissions.",
    
    # --- French: Business / Management ---
    "Géré un portefeuille de projets d'une valeur totale de 500K DT, livrant 95% des projets dans les délais.",
    "Augmenté le chiffre d'affaires de 25% en développant de nouveaux partenariats stratégiques dans le secteur IT tunisien.",
    "Coordonné les activités de 3 départements pour assurer la cohérence de la stratégie commerciale.",
    "Rédigé et présenté des rapports financiers trimestriels au comité de direction.",
    
    # --- French: Marketing / Communication ---
    "Conçu et exécuté des campagnes marketing digital augmentant le trafic web de 150% en 6 mois.",
    "Géré les réseaux sociaux de l'entreprise, atteignant 50K+ abonnés avec un taux d'engagement de 4.5%.",
    "Créé du contenu multilingue (français, anglais, arabe) pour les supports de communication interne et externe.",
    
    # --- English: Software Engineering ---
    "Built and maintained a scalable microservices architecture serving 1M+ API requests daily using Kubernetes and Docker.",
    "Led the migration of a monolithic application to a cloud-native architecture on AWS, reducing infrastructure costs by 35%.",
    "Implemented real-time data processing pipelines using Apache Kafka and Spark, handling 100K+ events per second.",
    "Designed and developed responsive web applications using React, TypeScript, and Tailwind CSS with 99.9% uptime.",
    "Mentored 3 junior developers, conducting code reviews and establishing coding standards across the team.",
    
    # --- English: Data / AI ---
    "Developed machine learning models achieving 92% accuracy in customer churn prediction, reducing attrition by 15%.",
    "Built an automated ETL pipeline processing 50GB+ of data daily using Python, Airflow, and BigQuery.",
    
    # --- French: Professional Summaries ---
    "Ingénieur logiciel passionné avec 5 ans d'expérience en développement web full-stack. Expert en React, Python et architectures cloud. Reconnu pour sa capacité à livrer des solutions performantes et scalables.",
    "Chef de projet digital avec 7 ans d'expérience dans le secteur IT tunisien. Certifié PMP et Scrum Master. Spécialisé dans la transformation digitale des entreprises.",
    "Développeuse full-stack junior passionnée par l'innovation technologique. Diplômée de l'INSAT en génie informatique. Maîtrise de React, Node.js et des méthodologies agiles.",
    "Data Scientist avec 3 ans d'expérience en machine learning et analyse de données. Compétences avancées en Python, TensorFlow et visualisation de données. Bilingue français-anglais.",
]


def _get_client():
    """Get or create ChromaDB client."""
    global _client
    if _client is None:
        _client = chromadb.HttpClient(
            host=settings.chromadb_host,
            port=settings.chromadb_port,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _client


def _get_collection():
    """Get or create the cv_examples collection."""
    global _collection
    if _collection is None:
        client = _get_client()
        _collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "CV example bullet points and summaries"},
        )
    return _collection


async def seed_if_empty():
    """
    Seed the ChromaDB collection with sample CV data if it's empty.
    Called on application startup.
    """
    try:
        collection = _get_collection()
        count = collection.count()

        if count > 0:
            logger.info(f"ChromaDB collection '{COLLECTION_NAME}' already has {count} documents. Skipping seed.")
            return

        # Seed with sample data
        ids = [f"cv_example_{i}" for i in range(len(SEED_DATA))]
        metadatas = [
            {
                "language": "fr" if any(c in doc for c in "éèêëàâùûîïôçÉÈ") else "en",
                "type": "summary" if len(doc) > 150 else "bullet_point",
            }
            for doc in SEED_DATA
        ]

        collection.add(
            documents=SEED_DATA,
            ids=ids,
            metadatas=metadatas,
        )

        logger.info(f"Seeded ChromaDB collection '{COLLECTION_NAME}' with {len(SEED_DATA)} documents.")

    except Exception as e:
        logger.warning(f"Failed to seed ChromaDB (service may not be available): {e}")


async def query_relevant_context(
    keywords: list[str],
    n_results: int = 5,
    language: str | None = None,
) -> str:
    """
    Query ChromaDB for relevant CV bullet points and summaries
    based on offer keywords.
    Returns formatted context string for the Gemini prompt.
    """
    try:
        collection = _get_collection()

        # Build query string from keywords
        query_text = " ".join(keywords)

        # Optional language filter
        where_filter = None
        if language:
            where_filter = {"language": language}

        results = collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where_filter,
        )

        if not results or not results["documents"] or not results["documents"][0]:
            logger.info("No RAG context found, returning empty context")
            return "Aucun exemple disponible."

        # Format results as context
        documents = results["documents"][0]
        context_parts = [f"- {doc}" for doc in documents]
        context = "\n".join(context_parts)

        logger.info(f"Retrieved {len(documents)} RAG context documents")
        return context

    except Exception as e:
        logger.warning(f"RAG query failed (ChromaDB may be unavailable): {e}")
        return "Aucun exemple disponible (service RAG indisponible)."
