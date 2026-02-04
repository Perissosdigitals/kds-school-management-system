#!/bin/bash

# 🐳 Docker Utility Script for KDS School Management System
# Allows running commands across services and managing the Docker environment

echo "🐳 KDS Docker Manager"
echo "======================"

COMMAND=$1
SERVICE=$2
ARGS=${@:3}

if [ -z "$COMMAND" ]; then
    echo "Usage: ./docker-utils.sh [start|stop|restart|logs|exec] [service] [args...]"
    echo ""
    echo "Commands:"
    echo "  start       - Start all services (detached)"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart all services"
    echo "  logs        - View logs (follow)"
    echo "  exec        - Execute command in service"
    echo "  status      - View container status"
    echo ""
    echo "Services:"
    echo "  api         - API Gateway (kds-api-gateway)"
    echo "  db          - PostgreSQL (kds-postgres)"
    echo "  redis       - Redis (kds-redis)"
    echo "  worker      - Queue Worker (kds-queue-worker)"
    echo "  realtime    - Realtime Service (kds-realtime)"
    exit 1
fi

DOCKER_COMPOSE_FILE="backend/docker-compose.yml"

# Map simplified names to internal service names
get_service_name() {
    case $1 in
        "api") echo "api-gateway" ;;
        "db") echo "postgres" ;;
        "redis") echo "redis" ;;
        "worker") echo "queue-worker" ;;
        "realtime") echo "realtime" ;;
        *) echo "$1" ;;
    esac
}

case $COMMAND in
    start)
        echo "🚀 Starting Docker services..."
        docker compose -f $DOCKER_COMPOSE_FILE up -d
        ;;
    stop)
        echo "🛑 Stopping Docker services..."
        docker compose -f $DOCKER_COMPOSE_FILE down
        ;;
    restart)
        echo "🔄 Restarting Docker services..."
        docker compose -f $DOCKER_COMPOSE_FILE restart
        ;;
    logs)
        INTERNAL_SERVICE=$(get_service_name $SERVICE)
        echo "📝 Showing logs for $INTERNAL_SERVICE..."
        docker compose -f $DOCKER_COMPOSE_FILE logs -f $INTERNAL_SERVICE
        ;;
    exec)
        if [ -z "$SERVICE" ]; then
            echo "❌ Error: Service name required for exec"
            exit 1
        fi
        INTERNAL_SERVICE=$(get_service_name $SERVICE)
        echo "💻 Executing in $INTERNAL_SERVICE: $ARGS"
        docker compose -f $DOCKER_COMPOSE_FILE exec $INTERNAL_SERVICE $ARGS
        ;;
    status)
        echo "📊 Container Status:"
        docker compose -f $DOCKER_COMPOSE_FILE ps
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        exit 1
        ;;
esac
