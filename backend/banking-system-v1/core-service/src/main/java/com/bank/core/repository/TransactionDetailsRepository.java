package com.bank.core.repository;

import com.bank.core.entity.TransactionDetailsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TransactionDetailsRepository extends JpaRepository<TransactionDetailsEntity, UUID> {
}
