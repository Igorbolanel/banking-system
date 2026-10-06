package com.bank.core.repository;

import com.bank.core.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Чтение транзакций сразу по всем счетам пользователя — для поиска и аналитики.
 * Отдельный репозиторий, чтобы не трогать существующий TransactionRepository.
 */
public interface OperationTransactionRepository extends JpaRepository<TransactionEntity, UUID> {

    List<TransactionEntity> findAllByFromAccountIdInOrToAccountIdInOrderByCreatedAtDesc(
            Collection<Long> fromAccountIds,
            Collection<Long> toAccountIds);
}
